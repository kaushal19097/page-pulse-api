import axios from 'axios';
import { logger } from '../utils/logger';

const MAX_CONCURRENT_AUDITS = parseInt(process.env.MAX_CONCURRENT_AUDITS || '50', 10);
const TIMEOUT_MS = parseInt(process.env.AUDIT_TIMEOUT_MS || '5000', 10);

let activeAudits = 0;

export const performAudit = async (url: string) => {
  if (activeAudits >= MAX_CONCURRENT_AUDITS) {
    throw { status: 429, message: 'Server is currently handling too many audit requests. Try again later.' };
  }

  activeAudits++;
  const startTime = Date.now();
  
  try {
    const response = await axios.get(url, {
      timeout: TIMEOUT_MS,
      headers: {
        'User-Agent': 'PagePulse-AuditService/1.0',
      },
    });

    const duration = Date.now() - startTime;
    
    return {
      url,
      status: response.status,
      responseTimeMs: duration,
      contentLength: response.headers['content-length'] || (response.data && response.data.length) || 0,
      timestamp: new Date().toISOString()
    };
  } catch (error: any) {
    const duration = Date.now() - startTime;
    logger.warn({ url, error: error.message }, 'Audit fetch failed');
    
    return {
      url,
      status: error.response?.status || 500,
      responseTimeMs: duration,
      error: error.message,
      timestamp: new Date().toISOString()
    };
  } finally {
    activeAudits--;
  }
};
