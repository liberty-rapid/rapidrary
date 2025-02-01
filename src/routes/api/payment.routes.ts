import { Router } from 'express';
import asyncHandler from 'express-async-handler';

import paymentController from '../../controllers/api/payment.controller';
import { body } from 'express-validator';
import { validate } from '../../middlewares/validate';

const router = Router();

router.post('/confirm-payment', validate([
    body('paymentKey'),
    body('orderId'),
    body('amount').isInt()
]), asyncHandler(paymentController.confirmPayment));

export default router;
