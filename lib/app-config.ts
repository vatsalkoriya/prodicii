const DEFAULT_APP_URL = 'https://prodicci.vercel.app';

function sanitizeUrl(u: string) {
	return u.replace(/\/$/, '');
}

function resolveAppUrl(): string {
	// Prefer Vercel provided URL when available (runtime)
	if (process.env.VERCEL_URL) return sanitizeUrl(`https://${process.env.VERCEL_URL}`);

	const envUrl = process.env.NEXT_PUBLIC_APP_URL;

	// In production builds, avoid using a localhost URL leaked from a .env file.
	if (process.env.NODE_ENV === 'production') {
		if (envUrl && !/localhost/i.test(envUrl)) return sanitizeUrl(envUrl);
		return DEFAULT_APP_URL;
	}

	// Development or when no production constraints: prefer explicit env, else default
	return sanitizeUrl(envUrl || DEFAULT_APP_URL);
}

export const APP_URL = resolveAppUrl();

const envHost = process.env.NEXT_PUBLIC_APP_HOST;
export const APP_HOST = (process.env.NODE_ENV === 'production' && envHost && /localhost/i.test(envHost))
	? new URL(APP_URL).host
	: (envHost || new URL(APP_URL).host);

export const APP_SUBDOMAIN_SUFFIX = `.${APP_HOST}`;
