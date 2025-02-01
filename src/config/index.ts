import dotenv from 'dotenv';

import { getBooleanEnv, getNumberEnv, getStringEnv } from '../utils/env-utils';

import { Config } from './config-type';

dotenv.config();

const config: Config = {
    port: getNumberEnv('PORT', 3000),
    devMode: getStringEnv('NODE_ENV', 'development') === 'development',

    site: {
        description: getStringEnv('SITE_DESCRIPTION', 'Rapidrary is an e-commerce platform for high-quality digital content.')
    },

    log: {
        directory: getStringEnv('LOG_DIR', './logs')
    },

    email: {
        fromName: getStringEnv('EMAIL_FROM_NAME', 'Rapidrary'),
        fromAddress: getStringEnv('EMAIL_FROM_ADDRESS', ''),
        sendMailToken: getStringEnv('SEND_MAIL_TOKEN', '')
    },

    oauth: {
        github: {
            clientId: getStringEnv('OAUTH_GITHUB_CLIENT_ID', ''),
            clientSecret: getStringEnv('OAUTH_GITHUB_CLIENT_SECRET', '')
        },
        discord: {
            clientId: getStringEnv('OAUTH_DISCORD_CLIENT_ID', ''),
            clientSecret: getStringEnv('OAUTH_DISCORD_CLIENT_SECRET', '')
        }
    },

    https: {
        useHttps: getBooleanEnv('USE_HTTPS', false),
        keyFile: getStringEnv('HTTPS_KEY', ''),
        certFile: getStringEnv('HTTPS_CERT', '')
    },

    session: {
        secret: getStringEnv('SESSION_SECRET', 'insecure-default-secret'),
    },

    redis: {
        url: getStringEnv('REDIS_URL', 'redis://localhost:6379'),
    },

    tossPayments: {
        secretKey: getStringEnv('TOSSPAYMENTS_SECRET_KEY', 'test_gsk_docs_OaPz8L5KdmQXkzRz3y47BMw6'),
    },

    books: {
        directory: getStringEnv('BOOKS_DIR', './books'),
    }
};

export default config;
