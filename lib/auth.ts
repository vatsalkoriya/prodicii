import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-fallback-secret-change-in-production';

export interface TokenPayload {
  userId: string;
  email: string;
}

export function signToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET!, { expiresIn: '7d' });
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET!) as TokenPayload;
  } catch (error: any) {
    console.error('[verifyToken] JWT verification failed:', error?.message || error);
    return null;
  }
}

/** Extract and verify Bearer token from Authorization header */
export function authFromRequest(req: Request): TokenPayload | null {
  const auth = req.headers.get('authorization') || '';
  console.log('[authFromRequest] Authorization header value:', auth ? `Bearer ${auth.slice(0, 15)}...` : '(empty)');
  const token = auth.replace(/^Bearer\s+/i, '').trim();
  if (!token) {
    console.log('[authFromRequest] Token is empty after processing Bearer prefix');
    return null;
  }
  const verified = verifyToken(token);
  console.log('[authFromRequest] Token verification result:', verified ? 'SUCCESS' : 'FAILED');
  return verified;
}
