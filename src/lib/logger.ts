// Simplified logger for Majhong admin (mock repository removed)
type LogLevel = 'info' | 'warn' | 'error' | 'debug';

function log(level: LogLevel, message: string, meta?: Record<string, unknown>) {
  const ts = new Date().toISOString();
  const entry = { level, message, ts, ...meta };
  if (level === 'error') console.error(JSON.stringify(entry));
  else if (level === 'warn') console.warn(JSON.stringify(entry));
  else console.log(JSON.stringify(entry));
}

function normalizeArgs(
  args: [string, Record<string, unknown>?] | [string, string, string, Record<string, unknown>?]
): { message: string; meta?: Record<string, unknown> } {
  if (args.length >= 3) {
    const [module, action, message, meta] =
      args as [string, string, string, Record<string, unknown>?];
    return {
      message,
      meta: {
        module,
        action,
        ...meta
      }
    };
  }

  const [message, meta] = args as [string, Record<string, unknown>?];
  return { message, meta };
}

export const logger = {
  info: (...args: [string, Record<string, unknown>?] | [string, string, string, Record<string, unknown>?]) => {
    const { message, meta } = normalizeArgs(args);
    log('info', message, meta);
  },
  warn: (...args: [string, Record<string, unknown>?] | [string, string, string, Record<string, unknown>?]) => {
    const { message, meta } = normalizeArgs(args);
    log('warn', message, meta);
  },
  error: (...args: [string, Record<string, unknown>?] | [string, string, string, Record<string, unknown>?]) => {
    const { message, meta } = normalizeArgs(args);
    log('error', message, meta);
  },
  debug: (...args: [string, Record<string, unknown>?] | [string, string, string, Record<string, unknown>?]) => {
    const { message, meta } = normalizeArgs(args);
    log('debug', message, meta);
  },
};
