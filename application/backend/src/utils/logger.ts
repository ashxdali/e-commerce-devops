type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LogPayload {
  timestamp: string;
  level: LogLevel;
  message: string;
  meta?: Record<string, unknown>;
}

const SENSITIVE_KEYS = [
  'password',
  'token',
  'jwt',
  'secret',
  'authorization',
  'apikey',
  'api_key',
  'database_url',
  'db_pass',
];

function sanitize(obj: unknown): unknown {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj === 'string') {
    return obj;
  }
  if (Array.isArray(obj)) {
    return obj.map(sanitize);
  }
  if (typeof obj === 'object') {
    const cleaned: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
      if (SENSITIVE_KEYS.some((sk) => key.toLowerCase().includes(sk))) {
        cleaned[key] = '[REDACTED]';
      } else {
        cleaned[key] = sanitize(value);
      }
    }
    return cleaned;
  }
  return obj;
}

function printLog(level: LogLevel, message: string, meta?: Record<string, unknown>): void {
  const payload: LogPayload = {
    timestamp: new Date().toISOString(),
    level,
    message,
    ...(meta ? { meta: sanitize(meta) as Record<string, unknown> } : {}),
  };

  const jsonOutput = JSON.stringify(payload);
  if (level === 'error') {
    console.error(jsonOutput);
  } else if (level === 'warn') {
    console.warn(jsonOutput);
  } else {
    console.log(jsonOutput);
  }
}

export const logger = {
  info: (message: string, meta?: Record<string, unknown>) => printLog('info', message, meta),
  warn: (message: string, meta?: Record<string, unknown>) => printLog('warn', message, meta),
  error: (message: string, meta?: Record<string, unknown>) => printLog('error', message, meta),
  debug: (message: string, meta?: Record<string, unknown>) => printLog('debug', message, meta),
};
