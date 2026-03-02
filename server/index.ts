import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initializeDatabase } from './db.js';
import authRoutes from './routes/auth.js';
import pollsRoutes from './routes/polls.js';
import votesRoutes from './routes/votes.js';
import logger from './logger.js';

dotenv.config();

const app: Express = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use((req: Request, res: Response, next: NextFunction) => {
    const start = Date.now();

    res.on('finish', () => {
        const duration = Date.now() - start;
        const authReq = req as any;
        const userInfo = authReq.userEmail ? `user: ${authReq.userEmail}` : 'anonymous';

        logger.info(`${req.method} ${req.url} | ${userInfo} | status: ${res.statusCode} | ${duration}ms`);
    });
    next();
});

app.use('/api/auth', authRoutes);
app.use('/api/polls', pollsRoutes);
app.use('/api/votes', votesRoutes);

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
});

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    logger.error('Unhandled error', {
        error: err.message,
        stack: err.stack,
        url: req.url,
        method: req.method
    });
    res.status(500).json({ error: 'Errore interno del server' });
});

const startServer = async () => {
    try {
        await initializeDatabase();
        app.listen(PORT, () => {
            logger.info(`Server listening on http://localhost:${PORT} (${process.env.NODE_ENV || 'development'})`);
        });
    } catch (error) {
        logger.error(`Server startup failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        process.exit(1);
    }
};

startServer();
