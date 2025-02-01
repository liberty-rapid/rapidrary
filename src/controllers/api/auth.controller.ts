import { Request, Response } from "express"

import authService from '../../services/auth.service';

export class AuthController {
    public requestEmailVerification = async (req: Request, res: Response): Promise<void> => {
        const { email } = req.body;

        const verification = await authService.requestEmailVerification(email);

        res.json(verification);
    }

    public signInByEmail = async (req: any, res: Response): Promise<void> => {
        const { verificationId, email, code } = req.body;

        const result = await authService.signInByEmail({ verificationId, email, code });   

        req.session.userId = result.id;

        await new Promise<void>(resolve => req.session.regenerate((err: any) => {
            if (err) throw err;
            resolve();
        }));

        req.session.userId = result.id;

        res.json(result);
    }

    public signInByOAuth = async (req: any, res: Response): Promise<void> => {
        const { provider, authorizationCode, redirectUrl } = req.body;

        const result = await authService.signInByOAuth({ provider, authorizationCode, redirectUrl });   

        req.session.userId = result.id;

        await new Promise<void>(resolve => req.session.regenerate((err: any) => {
            if (err) throw err;
            resolve();
        }));

        req.session.userId = result.id;

        res.json(result);
    }
}

const authController = new AuthController();

export default authController;
