const DEFAULT_APP_URL = 'https://prodicci.vercel.app';

export const APP_URL = (process.env.NEXT_PUBLIC_APP_URL || DEFAULT_APP_URL).replace(/\/$/, '');
export const APP_HOST = process.env.NEXT_PUBLIC_APP_HOST || new URL(APP_URL).host;
export const APP_SUBDOMAIN_SUFFIX = `.${APP_HOST}`;
