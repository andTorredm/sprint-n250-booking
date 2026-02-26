import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import logger from './logger.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new sqlite3.Database(path.join(__dirname, 'database.sqlite'));

export const dbRun = (sql: string, params: any[] = []): Promise<sqlite3.RunResult> => {
    return new Promise((resolve, reject) => {
        db.run(sql, params, function (err) {
            if (err) reject(err);
            else resolve(this);
        });
    });
};

export const dbGet = <T = any>(sql: string, params: any[] = []): Promise<T | undefined> => {
    return new Promise((resolve, reject) => {
        db.get(sql, params, (err, row) => {
            if (err) reject(err);
            else resolve(row as T | undefined);
        });
    });
};

export const dbAll = <T = any>(sql: string, params: any[] = []): Promise<T[]> => {
    return new Promise((resolve, reject) => {
        db.all(sql, params, (err, rows) => {
            if (err) reject(err);
            else resolve(rows as T[]);
        });
    });
};

export const initializeDatabase = async () => {
    try {
        logger.info('Database initialization started');

        await dbRun(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        firstName TEXT NOT NULL,
        lastName TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'VOTER',
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

        await dbRun(`
      CREATE TABLE IF NOT EXISTS polls (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT,
        createdBy INTEGER NOT NULL,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        closedAt DATETIME,
        FOREIGN KEY (createdBy) REFERENCES users(id)
      )
    `);

        await dbRun(`
      CREATE TABLE IF NOT EXISTS poll_options (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        pollId INTEGER NOT NULL,
        optionText TEXT NOT NULL,
        FOREIGN KEY (pollId) REFERENCES polls(id) ON DELETE CASCADE
      )
    `);

        await dbRun(`
      CREATE TABLE IF NOT EXISTS votes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userId INTEGER NOT NULL,
        pollId INTEGER NOT NULL,
        optionId INTEGER NOT NULL,
        timestamp TEXT NOT NULL,
        UNIQUE(userId, pollId, optionId),
        FOREIGN KEY (userId) REFERENCES users(id),
        FOREIGN KEY (pollId) REFERENCES polls(id) ON DELETE CASCADE,
        FOREIGN KEY (optionId) REFERENCES poll_options(id) ON DELETE CASCADE
      )
    `);

        const adminEmail = process.env.ADMIN_EMAIL;
        const adminPassword = process.env.ADMIN_PASSWORD;
        const adminFirstName = process.env.ADMIN_FIRST_NAME || 'Admin';
        const adminLastName = process.env.ADMIN_LAST_NAME || 'User';

        if (adminEmail && adminPassword) {
            const existingAdmin = await dbGet('SELECT id FROM users WHERE email = ?', [adminEmail]);

            if (!existingAdmin) {
                const hashedPassword = await bcrypt.hash(adminPassword, 10);
                await dbRun(
                    'INSERT INTO users (email, password, firstName, lastName, role) VALUES (?, ?, ?, ?, ?)',
                    [adminEmail, hashedPassword, adminFirstName, adminLastName, 'ADMIN']
                );
                logger.info(`Admin user created: ${adminEmail}`);
            } else {
                logger.debug(`Admin user already exists: ${adminEmail}`);
            }
        } else {
            logger.warn('No admin credentials in env - use "npm run create-admin" to create admin manually');
        }

        logger.info('Database initialization completed');
    } catch (error) {
        logger.error(`Database initialization failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        throw error;
    }
};

export { db };
