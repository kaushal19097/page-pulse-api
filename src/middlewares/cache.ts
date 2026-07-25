import NodeCache from 'node-cache';
import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

const ttl = parseInt(process.env.CACHE_TTL_SECONDS || '60', 10);
export const cache = new NodeCache({ stdTTL: ttl });

export const cacheMiddleware = (req: Request, res: Response, next: NextFunction) => {
  if (req.method !== 'GET') {
    return next();
  }
  
  const key = req.originalUrl;
  const cachedResponse = cache.get(key);
  
  if (cachedResponse) {
    logger.info({ reqId: req.id, cacheHit: true, key }, 'Served from cache');
    res.setHeader('X-Cache', 'HIT');
    return res.json(cachedResponse);
  }
  
  res.setHeader('X-Cache', 'MISS');
  const originalJson = res.json.bind(res);
  res.json = (body: any) => {
    // Only cache 2xx responses
    if (res.statusCode >= 200 && res.statusCode < 300) {
      cache.set(key, body);
    }
    return originalJson(body);
  };
  
  next();
};
