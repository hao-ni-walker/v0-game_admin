const DEFAULT_ADMIN_API_ORIGIN = 'https://admin-api.jade.ai';

export function getAdminApiOrigin(): string {
  return (
    process.env.REMOTE_API_URL ||
    process.env.ADMIN_API_URL ||
    DEFAULT_ADMIN_API_ORIGIN
  ).replace(/\/+$/, '');
}

export function getAdminApiUrl(path: string): string {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${getAdminApiOrigin()}${normalizedPath}`;
}
