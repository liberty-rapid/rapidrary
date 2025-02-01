import path from 'path';

import express from 'express';
import compression from 'compression';
import helmet from 'helmet';

import config from './config';

import { getRedisClient } from './clients/redis';

import { errorHandler } from './middlewares/error-handler';
import { createSessionMiddleware } from './middlewares/session';
import { loggerMiddleware } from './middlewares/logger';

import routes from './routes';

export async function createApp(): Promise<express.Express> {
    const app = express();

    app.set('trust proxy', true);

    if (!config.devMode) {
        app.use(helmet.contentSecurityPolicy({
            directives: {
                defaultSrc: ["'self'"],
                scriptSrc: ["'self'", "'unsafe-inline'"],
                imgSrc: ["*"]
            }
        }));        
    }

    app.use(loggerMiddleware);

    const redisClient = await getRedisClient();
    const sessionMiddleware = await createSessionMiddleware(redisClient);
    app.use(sessionMiddleware);

    app.use(compression());
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    app.use('/', routes);

    app.use(express.static(path.join(__dirname, '../frontend/dist'), {
        dotfiles: 'deny'
    }));

    app.use('*', (req, res) => {
        res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
    });

    app.use(errorHandler);    

    return app;
}
