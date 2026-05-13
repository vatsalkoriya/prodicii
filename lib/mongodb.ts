import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || '';

if (!MONGODB_URI) {
  throw new Error('MONGODB_URI environment variable is not set');
}

/**
 * Global cache to prevent multiple connections in serverless (Vercel) environment.
 * Each hot-reload or cold start reuses the existing connection if available.
 */
declare global {
  // eslint-disable-next-line no-var
  var _mongooseCache: { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null };
}

const cache = global._mongooseCache ?? { conn: null, promise: null };
global._mongooseCache = cache;

export async function connect(): Promise<typeof mongoose> {
  if (cache.conn) return cache.conn;

  if (!cache.promise) {
    cache.promise = mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
      maxPoolSize: 10,
    });
  }

  cache.conn = await cache.promise;
  return cache.conn;
}
