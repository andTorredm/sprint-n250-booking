import express, { Router, Response } from 'express';
import { dbRun, dbGet, dbAll } from '../db.js';
import { authenticateToken, requireAdmin, AuthRequest } from '../middleware/auth.js';
import logger from '../logger.js';

const router: Router = express.Router();

router.get('/', authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
        const polls = await dbAll(`
      SELECT p.*, u.firstName, u.lastName
      FROM polls p
      JOIN users u ON p.createdBy = u.id
      ORDER BY p.createdAt DESC
    `);

        logger.info(`Fetched ${polls.length} polls - requested by ${req.userEmail}`);
        res.json(polls);
    } catch (error) {
        logger.error(`Error fetching polls for ${req.userEmail}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        res.status(500).json({ error: 'Errore interno del server' });
    }
});

router.get('/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;

        logger.debug('Fetching poll details', { pollId: id, userEmail: req.userEmail });

        const poll: any = await dbGet(
            `SELECT p.*, u.firstName, u.lastName
       FROM polls p
       JOIN users u ON p.createdBy = u.id
       WHERE p.id = ?`,
            [id]
        );

        if (!poll) {
            logger.warn(`Poll #${id} not found - requested by ${req.userEmail}`);
            return res.status(404).json({ error: 'Sondaggio non trovato' });
        }

        const options = await dbAll(
            'SELECT * FROM poll_options WHERE pollId = ?',
            [id]
        );

        const votes = await dbAll(
            `SELECT v.*, u.firstName, u.lastName, u.email, po.optionText
       FROM votes v
       JOIN users u ON v.userId = u.id
       JOIN poll_options po ON v.optionId = po.id
       WHERE v.pollId = ?
       ORDER BY v.timestamp ASC`,
            [id]
        );

        logger.info(`Fetched poll #${id} details: '${poll.title}' (${options.length} options, ${votes.length} votes) - ${req.userEmail}`);

        res.json({ ...poll, options, votes });
    } catch (error) {
        logger.error(`Error fetching poll #${req.params.id} for ${req.userEmail}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        res.status(500).json({ error: 'Errore interno del server' });
    }
});

router.post(
    '/',
    authenticateToken,
    requireAdmin,
    async (req: AuthRequest, res: Response) => {
        try {
            const { title, description, options } = req.body;

            logger.info('Creating new poll', { title, optionsCount: options?.length, userEmail: req.userEmail });

            if (!title || !options || !Array.isArray(options) || options.length === 0) {
                logger.warn(`Poll creation rejected: invalid data - ${req.userEmail}`);
                return res.status(400).json({ error: 'Titolo e opzioni sono obbligatori' });
            }

            const result = await dbRun(
                'INSERT INTO polls (title, description, createdBy) VALUES (?, ?, ?)',
                [title, description || '', req.userId]
            );

            const pollId = result.lastID;

            for (const option of options) {
                const optionText = typeof option === 'string' ? option : option.text;
                const capacity = typeof option === 'object' && option.capacity ? option.capacity : 6;
                await dbRun(
                    'INSERT INTO poll_options (pollId, optionText, capacity) VALUES (?, ?, ?)',
                    [pollId, optionText, capacity]
                );
            }

            logger.info(`Poll created: '${title}' (${options.length} options) - poll #${pollId} by ${req.userEmail}`);

            res.status(201).json({ id: pollId, title, description, options });
        } catch (error) {
            logger.error(`Error creating poll for ${req.userEmail}: ${error instanceof Error ? error.message : 'Unknown error'}`);
            res.status(500).json({ error: 'Errore interno del server' });
        }
    }
);

router.put(
    '/:id/close',
    authenticateToken,
    requireAdmin,
    async (req: AuthRequest, res: Response) => {
        try {
            const { id } = req.params;

            await dbRun('UPDATE polls SET closedAt = CURRENT_TIMESTAMP WHERE id = ?', [
                id,
            ]);

            logger.info(`Poll #${id} closed by ${req.userEmail}`);

            res.json({ message: 'Sondaggio chiuso con successo' });
        } catch (error) {
            logger.error(`Error closing poll #${req.params.id} for ${req.userEmail}: ${error instanceof Error ? error.message : 'Unknown error'}`);
            res.status(500).json({ error: 'Errore interno del server' });
        }
    }
);

export default router;
