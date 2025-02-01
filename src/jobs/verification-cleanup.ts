import cron from 'node-cron';

import prisma from '../clients/prisma';

import logger from "../utils/logger";

export function setupVerificationCleanupJob() {
    cron.schedule('* * * * *', async () => {
        const result = await prisma.emailVerification.deleteMany({
            where: {
                expiresAt: {
                    lte: new Date()
                }
            }
        });

        if (result.count !== 0) {
            logger.info(`Removed ${result.count} expired email verification(s).`);
        }
    });
}
