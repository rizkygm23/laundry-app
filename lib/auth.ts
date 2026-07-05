import crypto from 'crypto';

export const AUTH_COOKIE_NAME = 'auth_session';
export const PBKDF2_ITERATIONS = 100000;
export const PBKDF2_KEYLEN = 64;
export const PBKDF2_DIGEST = 'sha256';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  username: string;
  nomor_hp?: string;
  alamat?: string;
}

export interface SessionPayload {
  user: AuthUser;
  iat: number;
  exp: number;
}

/**
 * Hash password using PBKDF2 and return formatted string + salt.
 * Format: pbkdf2_sha256$iterations$salt$hash
 */
export function hashPassword(password: string): { hash: string; salt: string } {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto
    .pbkdf2Sync(password, salt, PBKDF2_ITERATIONS, PBKDF2_KEYLEN, PBKDF2_DIGEST)
    .toString('hex');
  return {
    salt,
    hash: `pbkdf2_sha256$${PBKDF2_ITERATIONS}$${salt}$${hash}`,
  };
}

/**
 * Verify a plain password against stored salt and hash.
 */
export function verifyPassword(password: string, salt: string, storedHash: string): boolean {
  const computed = crypto
    .pbkdf2Sync(password, salt, PBKDF2_ITERATIONS, PBKDF2_KEYLEN, PBKDF2_DIGEST)
    .toString('hex');
  return storedHash === `pbkdf2_sha256$${PBKDF2_ITERATIONS}$${salt}$${computed}`;
}

function base64UrlEncode(str: string): string {
  return Buffer.from(str, 'utf8')
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

function base64UrlDecode(str: string): string {
  const padding = '='.repeat((4 - (str.length % 4)) % 4);
  const base64 = str.replace(/-/g, '+').replace(/_/g, '/') + padding;
  return Buffer.from(base64, 'base64').toString('utf8');
}

function createSignature(payload: string, secret: string): string {
  return crypto.createHmac('sha256', secret).update(payload).digest('hex');
}

/**
 * Sign session payload into a cookie-safe token.
 */
export function signSession(payload: SessionPayload, secret: string): string {
  const payloadJson = JSON.stringify(payload);
  const payloadB64 = base64UrlEncode(payloadJson);
  const signature = createSignature(payloadB64, secret);
  return `${signature}.${payloadB64}`;
}

/**
 * Verify and decode session token.
 * Returns null if invalid or expired.
 */
export function verifySession(token: string, secret: string): SessionPayload | null {
  try {
    const [signature, payloadB64] = token.split('.');
    if (!signature || !payloadB64) return null;

    const expectedSignature = createSignature(payloadB64, secret);
    // timing-safe compare
    const sigBuf = Buffer.from(signature, 'hex');
    const expBuf = Buffer.from(expectedSignature, 'hex');
    if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
      return null;
    }

    const payloadJson = base64UrlDecode(payloadB64);
    const payload = JSON.parse(payloadJson) as SessionPayload;

    if (payload.exp && payload.exp < Date.now()) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

/**
 * Build a new session payload with 7-day expiration.
 */
export function createSessionPayload(user: AuthUser): SessionPayload {
  const now = Date.now();
  return {
    user,
    iat: now,
    exp: now + 1000 * 60 * 60 * 24 * 7, // 7 days
  };
}
