import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';
import pinoHttp from 'pino-http';
import { logger } from './utils/logger';
import { errorHandler } from './middlewares/errorHandler';
import { apiLimiter } from './middlewares/rateLimiter';
import auditRoutes from './routes/audit';

const app = express();

declare global {
  namespace Express {
    interface Request {
      id: string;
    }
  }
}
app.use((req, res, next) => {
  req.id = uuidv4();
  res.setHeader('X-Request-Id', req.id);
  next();
});

app.use(helmet());
app.use(cors());
app.use(express.json());

app.use(pinoHttp({
  logger,
  genReqId: (req) => req.id as string,
  customLogLevel: (req, res, err) => {
    if (res.statusCode >= 500 || err) return 'error';
    if (res.statusCode >= 400) return 'warn';
    return 'info';
  }
}));

app.use('/api', apiLimiter);
app.use('/api/audit', auditRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/', (req, res) => {
  const baseUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://page-pulse-api-theta.vercel.app';
  
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Page Pulse API - Production Service</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0f172a; color: #f8fafc; display: flex; flex-direction: column; justify-content: center; align-items: center; min-height: 100vh; margin: 0; padding: 20px; box-sizing: border-box; }
          .card { background: #1e293b; border-radius: 12px; border: 1px solid #334155; padding: 40px; max-width: 680px; width: 100%; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5); text-align: left; }
          h1 { margin-top: 0; color: #38bdf8; font-size: 2.2rem; text-align: center; }
          p.subtitle { color: #94a3b8; font-size: 1.1rem; text-align: center; margin-bottom: 30px; }
          h2 { color: #f1f5f9; font-size: 1.2rem; border-bottom: 1px solid #334155; padding-bottom: 8px; margin-top: 25px; }
          ul { list-style: none; padding: 0; margin: 0; }
          li { margin-bottom: 12px; line-height: 1.5; }
          code { background: #0f172a; color: #34d399; padding: 4px 8px; border-radius: 6px; font-family: monospace; font-size: 0.9rem; word-break: break-all; }
          a { color: #38bdf8; text-decoration: none; font-weight: 500; word-break: break-all; }
          a:hover { text-decoration: underline; }
          .label { color: #cbd5e1; font-weight: 600; display: block; margin-bottom: 4px; }
          footer { margin-top: 35px; padding-top: 20px; border-top: 1px solid #334155; font-size: 0.95rem; color: #94a3b8; text-align: center; }
        </style>
      </head>
      <body>
        <div class="card">
          <h1>⚡ Page Pulse API</h1>
          <p class="subtitle">Production-grade URL audit & microservice monitoring engine.</p>
          
          <h2>🔗 Project Complete Production & Endpoint URLs</h2>
          <ul>
            <li>
              <span class="label">Audit Endpoint (Valid URL Test):</span>
              <a href="${baseUrl}/api/audit?url=https://example.com" target="_blank">${baseUrl}/api/audit?url=https://example.com</a>
            </li>
            <li>
              <span class="label">Audit Endpoint (Validation Error Test):</span>
              <a href="${baseUrl}/api/audit?url=invalid-url" target="_blank">${baseUrl}/api/audit?url=invalid-url</a>
            </li>
            <li>
              <span class="label">Health Probe Endpoint:</span>
              <a href="${baseUrl}/health" target="_blank">${baseUrl}/health</a>
            </li>
            <li>
              <span class="label">Public GitHub Repository:</span>
              <a href="https://github.com/kaushal19097/page-pulse-api" target="_blank">https://github.com/kaushal19097/page-pulse-api</a>
            </li>
            <li>
              <span class="label">System Architecture Document:</span>
              <a href="https://github.com/kaushal19097/page-pulse-api/blob/main/architecture.md" target="_blank">https://github.com/kaushal19097/page-pulse-api/blob/main/architecture.md</a>
            </li>
            <li>
              <span class="label">Technical Implementation Plan:</span>
              <a href="https://github.com/kaushal19097/page-pulse-api/blob/main/IMPLEMENTATION_PLAN.md" target="_blank">https://github.com/kaushal19097/page-pulse-api/blob/main/IMPLEMENTATION_PLAN.md</a>
            </li>
          </ul>

          <footer>
            Built for Digital Heroes Training Task. Linked to <a href="https://digitalheroesco.com" target="_blank" rel="noopener noreferrer">digitalheroesco.com</a>
          </footer>
        </div>
      </body>
    </html>
  `);
});

app.use(errorHandler);

export default app;
