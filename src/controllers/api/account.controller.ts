import { Response } from "express";

import { getRedisClient } from "../../clients/redis";
import accountService from '../../services/account.service';

export class AccountController {
    private async deleteAllUserSessions(userId: string) {
        const redisClient = await getRedisClient();
        const sessions = await redisClient.keys(`session:${userId}:*`);
        
        if (sessions.length !== 0) {
            await redisClient.del(sessions);
        }
    }

    public checkEmail = async (req: any, res: Response): Promise<void> => {
        const result = await accountService.checkEmail(req.body.email);

        res.json(result);
    }

    public getMyInfo = async (req: any, res: Response): Promise<void> => {
        const user = await accountService.getMyInfo(req.session.userId ?? '');

        res.json(user);
    }

    public getMyPayments = async (req: any, res: Response): Promise<void> => {
        const payments = await accountService.getMyPayments(req.session.userId ?? '');

        res.json(payments);
    }

    public deleteMyAccount = async (req: any, res: Response): Promise<void> => {
        await accountService.deleteMyAccount(req.session.userId ?? '');

        const userId = req.session.userId;
        req.session.userId = null;
        req.session.destroy();

        await this.deleteAllUserSessions(userId);

        res.sendStatus(200);
    }

    public updateMyEmail = async (req: any, res: Response): Promise<void> => {
        const { verificationId, email, code } = req.body;

        await accountService.updateMyEmail({
            userId: req.session.userId ?? '',
            authentication: { verificationId, email, code }
        });

        res.sendStatus(200);
    }

    public updateMyDisplayName = async (req: any, res: Response): Promise<void> => {
        const { displayName } = req.body;

        await accountService.updateMyDisplayName({
            userId: req.session.userId ?? '',
            displayName
        });

        res.sendStatus(200);
    }

    public signOut = async (req: any, res: Response): Promise<void> => {
        if (req.session) {
            req.session.userId = null;
            req.session.destroy();       
        }

        res.sendStatus(200);
    }

    public signOutAll = async (req: any, res: Response): Promise<void> => {
        if (req.session.userId) {
            const userId = req.session.userId;
            req.session.userId = null;
            req.session.destroy();

            await this.deleteAllUserSessions(userId);
        }

        res.sendStatus(200);
    }
}

const accountController = new AccountController();

export default accountController;
