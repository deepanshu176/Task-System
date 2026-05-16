import { MongoClient, Db } from 'mongodb';
import { getLocalDB } from './local-db';

const databaseMode = process.env.DATABASE_MODE || 'local';
const isMongoMode = databaseMode === 'mongodb';
const mongoUri = process.env.MONGODB_URI;
const databaseName = process.env.MONGODB_DATABASE || 'taskmanager';

const mongoOptions = {
  maxPoolSize: 10,
  minPoolSize: 0,
  maxIdleTimeMS: 30000,
  connectTimeoutMS: 8000,
  serverSelectionTimeoutMS: 8000,
  socketTimeoutMS: 15000,
  retryWrites: true,
};

const localDB = getLocalDB() as unknown as Db;

declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

function getMongoClientPromise() {
  if (!mongoUri) {
    throw new Error('MONGODB_URI is required when DATABASE_MODE=mongodb');
  }

  if (!global._mongoClientPromise) {
    const client = new MongoClient(mongoUri, mongoOptions);
    global._mongoClientPromise = client.connect();
  }

  return global._mongoClientPromise;
}

export async function connectDB(): Promise<Db> {
  if (!isMongoMode) {
    return localDB;
  }

  const client = await getMongoClientPromise();
  return client.db(databaseName);
}

export const clientPromise = isMongoMode
  ? getMongoClientPromise()
  : Promise.resolve({ db: () => localDB } as unknown as MongoClient);

const dbClient = { connectDB, clientPromise };

export default dbClient;
