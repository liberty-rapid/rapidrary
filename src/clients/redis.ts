import { RedisClientType, createClient } from "redis";

import config from "../config";
import logger from "../utils/logger";

let redisClient: RedisClientType | null = null;

export async function getRedisClient() {
    if (!redisClient) {
        redisClient = createClient({
            url: config.redis.url,
            socket: {
                reconnectStrategy: function(retries) {
                    if (retries > 5) {
                        logger.log('error', 'Too many attempts to reconnect. Redis connection was terminated');
                        process.exit(1);
                    } else {
                        return retries * 200;
                    }
                }
            }
        });

        await redisClient.on('error', err => logger.log('error', err.message)).connect();
    }

    return redisClient;
}
