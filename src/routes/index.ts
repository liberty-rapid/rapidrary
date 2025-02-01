import { Router } from "express";

import apiRouter from './api'

const router = Router();

router.use('/api/v1/', apiRouter);

export default router;
