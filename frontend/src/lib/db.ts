import { MongoClient, Db } from 'mongodb';

/**
 * PRODUCTION-GRADE MONGODB CLIENT SINGLETON
 * 
 * Features:
 * 1. Global caching to prevent connection exhaustion during Next.js hot-reloads.
 * 2. Optimized pooling for MongoDB Atlas M0 (Free Tier) limits.
 * 3. Type-safe connection handling.
 * 4. Automatic idle connection cleanup.
 */

if (!process.env.MONGODB_URI) {
  throw new Error('Please add your Mongo URI to .env.local');
}

const uri = process.env.MONGODB_URI;
const options = {
  maxPoolSize: 10,             // Optimized for M0 Tier (limit 100-500)
  minPoolSize: 1,              // Keep at least one connection open
  maxIdleTimeMS: 30000,        // Close idle connections after 30s
  connectTimeoutMS: 10000,     // Time out after 10s
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  retryWrites: true,
};

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

if (process.env.NODE_ENV === 'development') {
  // In development mode, use a global variable so that the value
  // is preserved across module reloads caused by HMR.
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  // In production, we also want to cache the connection promise
  // to prevent re-connecting on every serverless function invocation.
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
}

/**
 * Connects to the database and returns the Db instance.
 * Reuses existing connections where possible.
 */
export async function connectDB(): Promise<Db> {
  const connectedClient = await clientPromise;
  const db = connectedClient.db(process.env.MONGODB_DATABASE || 'taskmanager');
  
  return db;
}

/**
 * Utility to get the raw client promise if needed (e.g. for transactions)
 */
export { clientPromise };

export default { connectDB, clientPromise };

