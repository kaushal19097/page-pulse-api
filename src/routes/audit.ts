import { Router } from 'express';
import { z } from 'zod';
import { performAudit } from '../services/auditService';
import { cacheMiddleware } from '../middlewares/cache';

const router = Router();

const auditSchema = z.object({
  url: z.string().url('Must be a valid URL').refine(
    (u) => u.startsWith('http://') || u.startsWith('https://'),
    { message: 'URL must start with http:// or https://' }
  ),
});

router.get('/', cacheMiddleware, async (req, res, next) => {
  try {
    const { url } = auditSchema.parse(req.query);
    const result = await performAudit(url);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

export default router;
