import { connectDB, clientPromise } from './db';

/**
 * MONGODB CLIENT PROXY
 * 
 * This file acts as a proxy to lib/db.ts to ensure consistent 
 * connection handling across the entire application.
 */

export { connectDB };
export default clientPromise;
