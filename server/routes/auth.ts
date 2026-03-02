import express, { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { dbRun, dbGet } from '../db.js';
import logger from '../logger.js';

const router: Router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

router.post('/register', async (req: Request, res: Response) => {
    try {
        const { email, password, firstName, lastName } = req.body;

        if (!email || !password || !firstName || !lastName) {
            logger.warn(`Registration rejected: missing fields for ${email || 'unknown'}`);
            return res.status(400).json({ error: 'Tutti i campi sono obbligatori' });
        }

        const existingUser = await dbGet('SELECT * FROM users WHERE email = ?', [
            email,
        ]);

        if (existingUser) {
            logger.warn(`Registration rejected: email already exists - ${email}`);
            return res.status(400).json({ error: 'Email già registrata' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const result = await dbRun(
            'INSERT INTO users (email, password, firstName, lastName, role) VALUES (?, ?, ?, ?, ?)',
            [email, hashedPassword, firstName, lastName, 'VOTER']
        );

        const userId = result.lastID;

        const token = jwt.sign({ userId, role: 'VOTER', email }, JWT_SECRET, {
            expiresIn: '7d',
        });

        logger.info(`Registration successful: ${firstName} ${lastName} (${email}) - user #${userId}`);

        res.status(201).json({
            token,
            user: {
                id: userId,
                email,
                firstName,
                lastName,
                role: 'VOTER',
            },
        });
    } catch (error) {
        logger.error(`Registration error for ${req.body.email}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        res.status(500).json({ error: 'Errore interno del server' });
    }
});

router.post('/login', async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            logger.warn(`Login rejected: missing credentials for ${email || 'unknown'}`);
            return res.status(400).json({ error: 'Email e password sono obbligatori' });
        }

        const user: any = await dbGet('SELECT * FROM users WHERE email = ?', [
            email,
        ]);

        if (!user) {
            logger.warn(`Login rejected: user not found - ${email}`);
            return res.status(401).json({ error: 'Credenziali non valide' });
        }

        const isValidPassword = await bcrypt.compare(password, user.password);

        if (!isValidPassword) {
            logger.warn(`Login rejected: invalid password for ${email} (user #${user.id})`);
            return res.status(401).json({ error: 'Credenziali non valide' });
        }

        const token = jwt.sign({ userId: user.id, role: user.role, email }, JWT_SECRET, {
            expiresIn: '7d',
        });

        logger.info(`Login successful: ${user.firstName} ${user.lastName} (${email}) - role: ${user.role}`);

        res.json({
            token,
            user: {
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role,
            },
        });
    } catch (error) {
        logger.error(`Login error for ${req.body.email}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        res.status(500).json({ error: 'Errore interno del server' });
    }
});

export default router;
