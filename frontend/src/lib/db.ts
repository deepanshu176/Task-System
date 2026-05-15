import { MongoClient, Db } from 'mongodb';

let client: MongoClient | null = null;
let db: Db | null = null;

export async function connectDB(): Promise<Db> {
  if (db) {
    return db;
  }

  const mongoUrl = process.env.MONGODB_URI;
  if (!mongoUrl) {
    throw new Error('MONGODB_URI environment variable is not set');
  }

  client = new MongoClient(mongoUrl);
  await client.connect();
  db = client.db(process.env.MONGODB_DATABASE || 'taskmanager');

  console.log('✅ Connected to MongoDB');
  return db;
}

export function getDB(): Db {
  if (!db) {
    throw new Error('Database not connected. Call connectDB() first');
  }
  return db;
}

export async function disconnectDB(): Promise<void> {
  if (client) {
    await client.close();
    client = null;
    db = null;
    console.log('Disconnected from MongoDB');
  }
}

export default { connectDB, getDB, disconnectDB };
