import { Request, Response, NextFunction } from 'express';
import winston from 'winston';

export interface ErrorWithStatus extends Error {
  status?: number;
}

const logger = winston.createLogger({
  level: 'error',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/error.log' }),
    new winston.transports.Console()
  ]
});

export const errorHandler = (
  err: ErrorWithStatus,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  logger.error({
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });

  const status = err.status || 500;
  const message = status === 500 ? 'Internal Server Error' : err.message;

  res.status(status).json({
    error: message,
    timestamp: new Date().toISOString(),
    path: req.url
  });
};