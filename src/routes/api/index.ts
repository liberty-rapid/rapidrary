import { Router } from "express";

import authRouter from './auth.routes';
import accountRouter from './account.routes';
import bookRouter from './book.routes';
import orderRouter from './order.routes';
import paymentRouter from './payment.routes';

const router = Router();

router.use('/', authRouter);
router.use('/', accountRouter);
router.use('/', bookRouter);
router.use('/', orderRouter);
router.use('/', paymentRouter);

export default router;
