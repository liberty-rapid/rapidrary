import { Router } from 'express';
import { body } from 'express-validator';
import asyncHandler from 'express-async-handler';

import orderController from '../../controllers/api/order.controller';
import { validate } from '../../middlewares/validate';

const router = Router();

router.post('/orders', validate([
    body('orderId'),
    body('bookId'),
    body('amount').isInt()
]), asyncHandler(orderController.createOrder));

export default router;
