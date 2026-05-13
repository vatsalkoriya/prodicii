const DEFAULT_APP_URL = 'https://prodicii.vercel.app';

function sanitizeUrl(u: string) {
	return u.replace(/\/$/, '');
}

function resolveAppUrl(): string {
	// VERCEL_PROJECT_PRODUCTION_URL is the stable production alias (e.g. prodicii.vercel.app).
	// VERCEL_URL is deployment-specific (e.g. prodicii-abc123.vercel.app) — do NOT use it
	// for APP_HOST because it won't match the canonical domain on incoming requests.
	if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
		return sanitizeUrl(`https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`);
	}

	const envUrl = process.env.NEXT_PUBLIC_APP_URL;

	// In production builds, avoid using a localhost URL leaked from a .env file.
	if (process.env.NODE_ENV === 'production') {
		if (envUrl && !/localhost/i.test(envUrl)) return sanitizeUrl(envUrl);
		return DEFAULT_APP_URL;
	}

	// Development: prefer explicit env, else default
	return sanitizeUrl(envUrl || DEFAULT_APP_URL);
}

export const APP_URL = resolveAppUrl();

// APP_HOST is used by middleware for subdomain routing.
// Priority: explicit NEXT_PUBLIC_APP_HOST > derived from APP_URL
const envHost = process.env.NEXT_PUBLIC_APP_HOST;
export const APP_HOST = (process.env.NODE_ENV === 'production' && envHost && /localhost/i.test(envHost))
	? new URL(APP_URL).host
	: (envHost || new URL(APP_URL).host);

export const APP_SUBDOMAIN_SUFFIX = `.${APP_HOST}`;
