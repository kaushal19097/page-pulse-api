import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';
import { ZodError } from 'zod';

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof ZodError) {
    logger.warn({ reqId: req.id, issues: err.issues }, 'Validation Error');
    return res.status(400).json({
      error: 'Invalid Input',
      details: err.issues.map(i => ({ path: i.path.join('.'), message: i.message }))
    });
  }

  logger.error({ reqId: req.id, err }, 'Internal Server Error');
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
  });
};
