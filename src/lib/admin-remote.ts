import http from 'node:http';
import https from 'node:https';

type RemoteMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export interface RemoteApiResponse<T = unknown> {
  ok: boolean;
  status: number;
  headers: http.IncomingHttpHeaders;
  text: string;
  data: T | null;
}

// Server-side upstream for backend admin calls. NEVER expose this origin to
// the browser (no NEXT_PUBLIC_* fallback on purpose): the admin UI talks to
// its own /api routes, which forward server-side.
const DEFAULT_REMOTE_ORIGIN = 'https://api.work4workonlywork.com';

function firstNonEmptyString(...values: unknown[]): string {
  for (const value of values) {
    if (typeof value === 'string' && value.trim()) return value.trim();
  }
  return '';
}

/**
 * Operator-facing message for a non-OK remote response. The backend wraps
 * every error as `{code, message, trace_id}` (unified error_response), so the
 * actual refusal reason ("暂不可上架：市场已过 endDate" etc.) is in `message`;
 * `detail` covers raw FastAPI bodies, and a non-HTML `text` covers gateway
 * responses that never reached the app. Without this, callers showed a bare
 * "远程API错误: 400" that hid why the operation was rejected.
 */
export function remoteApiErrorMessage(
  response: { status: number; data?: unknown; text?: string },
  fallback = '远程API错误'
): string {
  let data = response.data;
  if (data == null && response.text) {
    try {
      data = JSON.parse(response.text);
    } catch {
      // non-JSON body (e.g. gateway HTML) — fall through to text handling
    }
  }
  const body = (data ?? null) as Record<string, unknown> | null;
  const text = typeof response.text === 'string' ? response.text : '';
  const detail = firstNonEmptyString(
    body?.message,
    body?.detail,
    text && !text.trimStart().startsWith('<') ? text : ''
  );
  return detail
    ? `${fallback}: ${response.status} ${detail.slice(0, 200)}`
    : `${fallback}: ${response.status}`;
}

function getRemoteOrigin() {
  return (process.env.ADMIN_API_URL || DEFAULT_REMOTE_ORIGIN).replace(/\/+$/, '');
}

export function buildRemoteAdminUrl(
  path: string,
  query?: URLSearchParams | string
): string {
  const url = new URL(path, `${getRemoteOrigin()}/`);
  if (query) {
    url.search = typeof query === 'string' ? query : query.toString();
  }
  return url.toString();
}

export async function requestRemoteAdminApi<T = unknown>(options: {
  path: string;
  method?: RemoteMethod;
  headers?: Record<string, string>;
  body?: string;
  query?: URLSearchParams | string;
}): Promise<RemoteApiResponse<T>> {
  const url = new URL(buildRemoteAdminUrl(options.path, options.query));
  const transport = url.protocol === 'https:' ? https : http;

  return new Promise((resolve, reject) => {
    const req = transport.request(
      {
        protocol: url.protocol,
        hostname: url.hostname,
        port: url.port || undefined,
        path: `${url.pathname}${url.search}`,
        method: options.method || 'GET',
        headers: options.headers,
      },
      (res) => {
        const chunks: Buffer[] = [];
        res.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
        res.on('end', () => {
          const text = Buffer.concat(chunks).toString('utf-8');
          let data: T | null = null;

          try {
            data = text ? (JSON.parse(text) as T) : null;
          } catch {
            data = null;
          }

          resolve({
            ok: (res.statusCode || 500) >= 200 && (res.statusCode || 500) < 300,
            status: res.statusCode || 500,
            headers: res.headers,
            text,
            data,
          });
        });
      }
    );

    req.on('error', reject);

    if (options.body) {
      req.write(options.body);
    }

    req.end();
  });
}
