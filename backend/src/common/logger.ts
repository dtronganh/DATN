import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';
import 'winston-daily-rotate-file';

function createLogger() {
  const isProduction = process.env.NODE_ENV === 'production';

  const fileTransport = new winston.transports.DailyRotateFile({
    filename: 'logs/app-%DATE%.log',
    datePattern: 'YYYY-MM-DD',
    zippedArchive: true,
    maxSize: '20m',
    maxFiles: '14d',
    level: isProduction ? 'info' : 'debug',
  });

  const errorReport = new winston.transports.DailyRotateFile({
    filename: 'logs/error-%DATE%.log',
    level: 'error',
    datePattern: 'YYYY-MM-DD',
    maxFiles: '30d',
  });

  return WinstonModule.createLogger({
    level: isProduction ? 'info' : 'debug',
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.errors({ stack: true }),
      winston.format.json(),
    ),
    transports: [
      new winston.transports.Console({
        level: isProduction ? 'info' : 'debug',
        format: isProduction
          ? winston.format.json()
          : winston.format.combine(
              winston.format.colorize(),
              winston.format.timestamp(),
              winston.format.printf(
                ({ timestamp, level, message, context, stack }) => {
                  return `${timestamp} [${context || 'App'}] ${level}: ${message}${stack ? '\n' + stack : ''}`;
                },
              ),
            ),
      }),
      fileTransport,
      errorReport,
    ],
  });
}

export const logger = createLogger();
