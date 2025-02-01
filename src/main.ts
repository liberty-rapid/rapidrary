import fs from 'fs/promises';
import https from 'https';
import cron from 'node-cron';
import prisma from './clients/prisma';

import { createApp } from './app';
import logger from './utils/logger';
import { setupJobs } from './jobs';

import config from './config';

async function onSigint() {
    logger.info('The server is shutting down...');

    cron.getTasks().forEach(task => task.stop());

    await prisma.$disconnect();

    process.exit(0);
}

async function main() {
    await fs.mkdir(config.books.directory, { recursive: true });

    const app = await createApp();

    if (config.https.useHttps) {
        const options = {
            key: await fs.readFile(config.https.keyFile),
            cert: await fs.readFile(config.https.certFile)
        };

        https.createServer(options, app).listen(config.port, () => {
            logger.info(`The HTTPS server is running on port ${config.port}`);
        });
    } else {
        app.listen(config.port, () => {
            logger.info(`The HTTP server is running on port ${config.port}`);
        });
    }

    setupJobs();

    process.on('SIGINT', onSigint);
}

main().then();
