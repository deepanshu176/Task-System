import { promises as fs } from 'fs';
import path from 'path';
import bcrypt from 'bcrypt';

const DATA_DIR = path.join(process.cwd(), '.data');
const USERS_FILE = path.join(DATA_DIR, 'local-users.json');
const BCRYPT_ROUNDS = 10;

export type LocalUser = {
  _id: string;
  email: string;
  password: string;
  name: string;
  role: string;
  permissions: string[];
  isActive: boolean;
  loginAttempts: number;
  lastLoginAttempt: string | null;
  createdAt: string;
  updatedAt: string;
};

export function isDatabaseUnavailable(error: unknown) {
  return error instanceof Error && (
    error.name === 'DatabaseTimeoutError' ||
    error.name === 'MongoServerSelectionError' ||
    error.name === 'MongoNetworkError' ||
    error.message.includes('querySrv') ||
    error.message.includes('Database connection timed out')
  );
}

async function readUsers(): Promise<LocalUser[]> {
  try {
    const data = await fs.readFile(USERS_FILE, 'utf8');
    return JSON.parse(data) as LocalUser[];
  } catch (error) {
    if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
      return [];
    }
    throw error;
  }
}

async function writeUsers(users: LocalUser[]) {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(USERS_FILE, JSON.stringify(users, null, 2));
}

export function publicUser(user: LocalUser) {
  return {
    id: user._id,
    email: user.email,
    name: user.name,
    role: user.role,
    permissions: user.permissions,
    isActive: user.isActive
  };
}

export async function createLocalUser(input: { email: string; name: string; password: string }) {
  const users = await readUsers();
  const email = input.email.toLowerCase();
  const existingUser = users.find((user) => user.email === email);

  if (existingUser) {
    return { user: null, alreadyExists: true };
  }

  const now = new Date().toISOString();
  const user: LocalUser = {
    _id: `local-${Date.now()}`,
    email,
    password: await bcrypt.hash(input.password, BCRYPT_ROUNDS),
    name: input.name,
    role: 'MEMBER',
    permissions: [],
    isActive: true,
    loginAttempts: 0,
    lastLoginAttempt: null,
    createdAt: now,
    updatedAt: now
  };

  users.push(user);
  await writeUsers(users);

  return { user, alreadyExists: false };
}

export async function findLocalUserByCredentials(email: string, password: string) {
  const users = await readUsers();
  const user = users.find((item) => item.email === email.toLowerCase());

  if (!user || !user.isActive) {
    return null;
  }

  const isMatch = await bcrypt.compare(password, user.password);
  return isMatch ? user : null;
}

export async function findLocalUserById(userId: string) {
  const users = await readUsers();
  return users.find((user) => user._id === userId) || null;
}
