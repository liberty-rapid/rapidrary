import { Request, Response, NextFunction } from 'express';

import logger from '../utils/logger';
import { ServiceError } from '../error/service-error';

export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
    if (err instanceof ServiceError) {
        res.status(err.status).json({ code: err.errorCode, message: err.message });
    } else {
        logger.error(`Server Error: ${err.message}`, {
            error: err.message,
            stack: err.stack,
            url: req.url,
            method: req.method,
            body: req.body,
            headers: req.headers,
            timestamp: new Date().toISOString()
        });
        res.status(500).json({ code: 'INTERNAL_SERVER_ERROR', message: 'Internal Server Error' });
    }
};
