import fs from 'fs';
import path from 'path';

import winston from 'winston';
import 'winston-daily-rotate-file';

import config from '../config';

if (!fs.existsSync(config.log.directory)) {
    fs.mkdirSync(config.log.directory);
}

const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
    ),
    transports: [
        new winston.transports.DailyRotateFile({
            filename: path.join(config.log.directory, 'rapidrary-server-%DATE%.log'),
            datePattern: 'YYYY-MM-DD',
            zippedArchive: true,
            maxFiles: '90d',
            maxSize: '20m'
        }),
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize(),
                winston.format.simple()
            )
        })
    ]
});

export default logger;
