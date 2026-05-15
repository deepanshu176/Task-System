import { NextRequest } from 'next/server';
import { verifyToken } from '@/lib/jwt-server';
import { connectDB } from '@/lib/db';
import { ObjectId } from 'mongodb';
import { getCachedData } from '@/lib/redis';
import { findLocalUserById, isDatabaseUnavailable } from '@/lib/local-auth-store';

// Lightweight in-memory cache for production environments without Redis
type AuthenticatedUser = {
  _id: string | ObjectId;
  email: string;
  name: string;
  role?: string;
  permissions?: string[];
  isActive: boolean;
  [key: string]: unknown;
};

const localUserCache = new Map<string, { data: AuthenticatedUser, expiry: number }>();
const CACHE_TTL = 300000; // 5 minutes
const allowLocalFallback = process.env.DATABASE_MODE !== 'mongodb';

function removePassword<T extends { password?: string }>(user: T) {
  const safeUser = { ...user };
  delete safeUser.password;
  return safeUser;
}

export async function authenticateRequest(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { user: null, error: 'Missing or invalid authorization header', status: 401 };
  }

  const token = authHeader.substring(7);
  const payload = verifyToken(token);
  
  if (!payload || !payload.userId) {
    return { user: null, error: 'Invalid or expired token', status: 401 };
  }

  const userId = payload.userId;

  if (allowLocalFallback && userId.startsWith('local-')) {
    const localUser = await findLocalUserById(userId);
    if (!localUser) {
      return { user: null, error: 'User account not found', status: 401 };
    }

    const user = removePassword(localUser);
    return { user, error: null, status: 200 };
  }

  // Check local cache first to avoid Redis/DB roundtrip if possible
  const cached = localUserCache.get(userId);
  if (cached && cached.expiry > Date.now()) {
    return { user: cached.data, error: null, status: 200 };
  }

  try {
    const user = await getCachedData(`user_session:${userId}`, async () => {
      const db = await connectDB();
      const users = await db.collection('users').aggregate([
        { $match: { _id: new ObjectId(userId) } },
        {
          $lookup: {
            from: 'roles',
            localField: 'roleId',
            foreignField: '_id',
            as: 'roleInfo'
          }
        },
        { $unwind: { path: '$roleInfo', preserveNullAndEmptyArrays: true } },
        {
          $addFields: {
            role: '$roleInfo.name',
            permissions: '$roleInfo.permissions'
          }
        },
        { $project: { roleInfo: 0, password: 0 } }
      ]).toArray();
      
      return (users[0] as AuthenticatedUser | undefined) || null;
    }, 600); // Cache user for 10 minutes in Redis

    if (!user) {
      return { user: null, error: 'User account not found', status: 401 };
    }

    // Update local cache
    localUserCache.set(userId, { data: user, expiry: Date.now() + CACHE_TTL });

    return { user, error: null, status: 200 };
  } catch (error) {
    if (allowLocalFallback && isDatabaseUnavailable(error)) {
      const localUser = await findLocalUserById(userId);
      if (localUser) {
        const user = removePassword(localUser);
        return { user, error: null, status: 200 };
      }
    }

    console.error('Authentication Database Error:', error);
    return { user: null, error: 'Internal Server Error (Database)', status: 500 };
  }
}
