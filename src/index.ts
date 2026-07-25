import app from './app';
import { logger } from './utils/logger';

const PORT = process.env.PORT || 3000;

if (!process.env.VERCEL) {
  const server = app.listen(PORT, () => {
    logger.info(`Server listening on port ${PORT}`);
  });

  process.on('SIGTERM', () => {
    logger.info('SIGTERM signal received: closing HTTP server');
    server.close(() => {
      logger.info('HTTP server closed');
    });
  });
}

export default app;
