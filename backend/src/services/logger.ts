import winston from 'winston';
import { ElasticsearchTransport } from 'winston-elasticsearch';

const { combine, timestamp, printf, colorize } = winston.format;

// Custom format for logs
const logFormat = printf(({ level, message, timestamp, ...metadata }) => {
  let msg = `${timestamp} [${level}]: ${message}`;
  if (Object.keys(metadata).length > 0) {
    msg += ` ${JSON.stringify(metadata)}`;
  }
  return msg;
});

// Create the logger instance
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: combine(
    timestamp(),
    winston.format.json()
  ),
  defaultMeta: { service: 'e-commerce-api' },
  transports: [
    // Console transport for development
    new winston.transports.Console({
      format: combine(
        colorize(),
        timestamp(),
        logFormat
      ),
    }),
    // File transport for all logs
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    new winston.transports.File({
      filename: 'logs/combined.log',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
  ],
});

// Add Elasticsearch transport if configured
if (process.env.ELASTICSEARCH_URL) {
  logger.add(
    new ElasticsearchTransport({
      level: 'info',
      index: 'e-commerce-logs',
      clientOpts: {
        node: process.env.ELASTICSEARCH_URL,
        auth: {
          username: process.env.ELASTICSEARCH_USERNAME,
          password: process.env.ELASTICSEARCH_PASSWORD,
        },
      },
    })
  );
}

// Create a stream object for Morgan
export const stream = {
  write: (message: string) => {
    logger.info(message.trim());
  },
};

export default logger; 