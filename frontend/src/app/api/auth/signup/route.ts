import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import { connectDB } from '@/lib/db';
import { signupSchema } from '@/lib/validation';
import { generateToken } from '@/lib/jwt-server';
import { ObjectId } from 'mongodb';

const BCRYPT_ROUNDS = 10;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate input
    const validatedData = signupSchema.parse(body);
    const { email, password, name } = validatedData;
    
    const db = await connectDB();

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
    if (error instanceof Error && error.message.includes('validation')) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
