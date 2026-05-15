import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import { connectDB } from '@/lib/db';
import { signupSchema } from '@/lib/validation';
import { generateToken } from '@/lib/jwt-server';
import { ZodError } from 'zod';
import { createLocalUser, isDatabaseUnavailable, publicUser } from '@/lib/local-auth-store';

const BCRYPT_ROUNDS = 10;
const DATABASE_TIMEOUT_MS = 3000;
const allowLocalFallback = process.env.DATABASE_MODE !== 'mongodb';

class DatabaseTimeoutError extends Error {
  constructor() {
    super('Database connection timed out');
    this.name = 'DatabaseTimeoutError';
  }
}

async function connectDBWithTimeout() {
  return Promise.race([
    connectDB(),
    new Promise<never>((_, reject) => {
      setTimeout(() => reject(new DatabaseTimeoutError()), DATABASE_TIMEOUT_MS);
    })
  ]);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate input
    const validatedData = signupSchema.parse(body);
    const { email, password, name } = validatedData;
    
    let db;
    try {
      db = await connectDBWithTimeout();
    } catch (error) {
      if (!allowLocalFallback || !isDatabaseUnavailable(error)) {
        throw error;
      }

      const { user, alreadyExists } = await createLocalUser({ email, password, name });
      if (alreadyExists || !user) {
        return NextResponse.json(
          { success: false, message: 'Email already registered' },
          { status: 409 }
        );
      }

      const token = generateToken({ userId: user._id }, '7d');
      return NextResponse.json(
        {
          success: true,
          message: 'Account created locally because MongoDB is unreachable',
          data: {
            token,
            user: publicUser(user)
          }
        },
        { status: 201 }
      );
    }

    // Check if user exists
    const existingUser = await db.collection('users').findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { success: false, message: 'Email already registered' },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, BCRYPT_ROUNDS);

    // Get or create default role
    let defaultRole = await db.collection('roles').findOne({ name: 'MEMBER' });
    if (!defaultRole) {
      const result = await db.collection('roles').insertOne({
        name: 'MEMBER',
        description: 'Standard member role',
        createdAt: new Date(),
        updatedAt: new Date()
      });
      defaultRole = await db.collection('roles').findOne({ _id: result.insertedId });
    }

    // Create user
    const result = await db.collection('users').insertOne({
      email,
      password: hashedPassword,
      name,
      roleId: defaultRole?._id,
      isActive: true,
      loginAttempts: 0,
      lastLoginAttempt: null,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    const user = await db.collection('users').findOne({ _id: result.insertedId });
    const token = generateToken({ userId: user?._id?.toString() || '' }, '7d');

    return NextResponse.json(
      {
        success: true,
        message: 'Account created successfully',
        data: {
          token,
          user: {
            id: user?._id?.toString(),
            email: user?.email,
            name: user?.name,
            role: defaultRole?.name,
            isActive: user?.isActive
          }
        }
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Signup error:', error);
    if (error instanceof ZodError) {
      return NextResponse.json(
        { success: false, message: error.issues[0].message || 'Validation failed' },
        { status: 400 }
      );
    }
    if (isDatabaseUnavailable(error)) {
      return NextResponse.json(
        { success: false, message: 'Database connection is taking too long. Please check MongoDB Atlas/network and try again.' },
        { status: 503 }
      );
    }
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
