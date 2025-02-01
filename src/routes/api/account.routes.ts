import { Router } from 'express';
import { body } from 'express-validator';
import asyncHandler from 'express-async-handler';

import accountController from '../../controllers/api/account.controller';
import { validate } from '../../middlewares/validate';

const router = Router();

router.post('/check-email', validate([
    body('email')
        .trim()
        .normalizeEmail()
        .isEmail()
]), asyncHandler(accountController.checkEmail));

router.post('/sign-out', asyncHandler(accountController.signOut));
router.post('/sign-out-all', asyncHandler(accountController.signOutAll));

router.get('/users/me', asyncHandler(accountController.getMyInfo));
router.get('/users/me/payments', asyncHandler(accountController.getMyPayments));
router.put('/users/me/display-name', validate([
    body('displayName').isLength({ min: 1 })
]), asyncHandler(accountController.updateMyDisplayName));
router.put('/users/me/email', validate([
    body('verificationId'),    
    body('email')
        .trim()
        .normalizeEmail()
        .isEmail(),
    body('code')
]), asyncHandler(accountController.updateMyEmail));
router.delete('/users/me', asyncHandler(accountController.deleteMyAccount));

export default router;
