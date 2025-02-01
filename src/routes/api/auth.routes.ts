import { Router } from 'express';
import { body } from 'express-validator';
import asyncHandler from 'express-async-handler';

import authController from '../../controllers/api/auth.controller';
import { validate } from '../../middlewares/validate';

const router = Router();

router.post('/email-verifications', validate([
    body('email')
        .trim()
        .normalizeEmail()
        .isEmail()
]), asyncHandler(authController.requestEmailVerification));

router.post('/sign-in-by-email', validate([
    body('verificationId'),    
    body('email')
        .trim()
        .normalizeEmail()
        .isEmail(),
    body('code')
]), asyncHandler(authController.signInByEmail));

router.post('/sign-in-by-oauth', validate([
    body('provider')   
        .custom(value => {
            const allowedProviders = [
                'github', 'discord'
            ];

            if (!allowedProviders.includes(value))
                throw new Error('Invalid Provider');

            return true;
        }),
    body('authorizationCode'),
    body('redirectUrl')
]), asyncHandler(authController.signInByOAuth));

export default router;
