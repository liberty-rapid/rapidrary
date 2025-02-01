import session from "express-session";
import RedisStore from "connect-redis";
import { RedisClientType } from "redis";

import config from "../config";

const generateSessionKey = (req: any) => {
    const userId = req.session?.userId ?? '0';
    const randomId = Math.random().toString(36).substring(2);

    return `${userId}:${randomId}`;
};

export async function createSessionMiddleware(redisClient: RedisClientType) {
    return session({
        store: new RedisStore({ client: redisClient, prefix: 'session:' }),
        secret: config.session.secret,
        resave: false,
        saveUninitialized: false,
        genid: generateSessionKey,
        cookie: {
            httpOnly: true,
            secure: !config.devMode,
            sameSite: !config.devMode
        }
    })
}
