import express, { Router, Response } from 'express';
import { dbRun, dbGet, dbAll } from '../db.js';
import { authenticateToken, AuthRequest } from '../middleware/auth.js';
import logger from '../logger.js';

const router: Router = express.Router();

router.post('/', authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
        const { pollId, optionIds } = req.body;
        const userId = req.userId;

        if (!pollId || !Array.isArray(optionIds)) {
            logger.warn(`Vote rejected: invalid request - ${req.userEmail}`);
            return res.status(400).json({ error: 'Invalid request' });
        }

        const poll: any = await dbGet('SELECT * FROM polls WHERE id = ?', [pollId]);
        if (!poll) {
            logger.warn(`Vote rejected: poll #${pollId} not found - ${req.userEmail}`);
            return res.status(404).json({ error: 'Poll not found' });
        }
        if (poll.closedAt) {
            logger.warn(`Vote rejected: poll #${pollId} is already closed - ${req.userEmail}`);
            return res.status(400).json({ error: 'Poll is closed' });
        }

        const currentVotes: any[] = await dbAll(
            'SELECT * FROM votes WHERE userId = ? AND pollId = ?',
            [userId, pollId]
        );

        const currentOptionIds = currentVotes.map((v) => v.optionId);
        const newOptionIds = optionIds;

        const toAdd = newOptionIds.filter((id: number) => !currentOptionIds.includes(id));
        const toRemove = currentOptionIds.filter((id) => !newOptionIds.includes(id));

        for (const optionId of toRemove) {
            await dbRun(
                'DELETE FROM votes WHERE userId = ? AND pollId = ? AND optionId = ?',
                [userId, pollId, optionId]
            );
        }

        for (const optionId of toAdd) {
            const timestamp = new Date().toISOString();
            await dbRun(
                'INSERT INTO votes (userId, pollId, optionId, timestamp) VALUES (?, ?, ?, ?)',
                [userId, pollId, optionId, timestamp]
            );
        }

        const action = toAdd.length > 0 && toRemove.length > 0 ? 'updated' : toAdd.length > 0 ? 'added' : 'removed';
        logger.info(`Vote ${action} for poll #${pollId} - ${req.userEmail} (${newOptionIds.length} total selections)`);

        res.json({ message: 'Vote updated successfully' });
    } catch (error) {
        logger.error(`Error voting on poll #${req.body.pollId} for ${req.userEmail}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.get('/:pollId/my-votes', authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
        const { pollId } = req.params;
        const userId = req.userId;

        const votes = await dbAll(
            'SELECT optionId FROM votes WHERE userId = ? AND pollId = ?',
            [userId, pollId]
        );

        logger.debug(`Fetched ${votes.length} votes for poll #${pollId} - ${req.userEmail}`);

        res.json(votes.map((v: any) => v.optionId));
    } catch (error) {
        logger.error(`Error fetching votes for poll #${req.params.pollId} - ${req.userEmail}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;
