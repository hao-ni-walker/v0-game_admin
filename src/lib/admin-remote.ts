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

const DEFAULT_REMOTE_ORIGIN = 'https://apiexchange.haohaotest.com';

function getRemoteOrigin() {
  return (process.env.NEXT_PUBLIC_ADMIN_API_URL || DEFAULT_REMOTE_ORIGIN).replace(
    /\/+$/,
    ''
  );
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
