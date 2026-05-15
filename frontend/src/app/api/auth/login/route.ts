import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import { connectDB } from '@/lib/mongodb';
import { loginSchema } from '@/lib/validation';
import { generateToken } from '@/lib/jwt-server';
import { ZodError } from 'zod';
import { findLocalUserByCredentials, isDatabaseUnavailable, publicUser } from '@/lib/local-auth-store';

const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes
const allowLocalFallback = process.env.DATABASE_MODE !== 'mongodb';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate input
    const validatedData = loginSchema.parse(body);
    const { email, password } = validatedData;
    
    let db;
    try {
      db = await connectDB();
    } catch (error) {
      if (!allowLocalFallback || !isDatabaseUnavailable(error)) {
        throw error;
      }

      const localUser = await findLocalUserByCredentials(email, password);
      if (!localUser) {
        return NextResponse.json(
          { success: false, message: 'Invalid email or password' },
          { status: 401 }
        );
      }

      const token = generateToken({ userId: localUser._id }, '7d');
      return NextResponse.json(
        {
          success: true,
          message: 'Login successful',
          data: {
            token,
            user: publicUser(localUser)
          }
        },
        { status: 200 }
      );
    }

    // Find user
    const user = await db.collection('users').findOne({ email });
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Invalid email or password' },
        { status: 401 }
      );
    }
    
    // Check if user is active
    if (!user.isActive) {
      return NextResponse.json(
        { success: false, message: 'Account is deactivated' },
        { status: 403 }
      );
    }

    // Check for lockout
    if (user.loginAttempts >= MAX_LOGIN_ATTEMPTS) {
      const lastAttempt = new Date(user.lastLoginAttempt);
      const timePassed = Date.now() - lastAttempt.getTime();
      
      if (timePassed < LOCKOUT_DURATION) {
        return NextResponse.json(
          { success: false, message: 'Account temporarily locked. Try again later.' },
          { status: 429 }
        );
      }
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      // Increment failed attempts
      await db.collection('users').updateOne(
        { _id: user._id },
        {
          $set: {
            loginAttempts: user.loginAttempts + 1,
            lastLoginAttempt: new Date()
          }
        }
      );
      
      return NextResponse.json(
        { success: false, message: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Reset login attempts on successful login
    await db.collection('users').updateOne(
      { _id: user._id },
      {
        $set: {
          loginAttempts: 0,
          lastLogin: new Date(),
          lastLoginAttempt: null
        }
      }
    );

    // Get user's role
    const role = await db.collection('roles').findOne({ _id: user.roleId });
    const token = generateToken({ userId: user._id.toString() }, '7d');

    return NextResponse.json(
      {
        success: true,
        message: 'Login successful',
        data: {
          token,
          user: {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
            role: role?.name || 'MEMBER',
            isActive: user.isActive
          }
        }
      },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { success: false, message: error.issues[0].message || 'Validation failed' },
        { status: 400 }
      );
    }
    if (isDatabaseUnavailable(error)) {
      return NextResponse.json(
        { success: false, message: 'Database unreachable. Please check your Atlas IP whitelist.' },
        { status: 503 }
      );
    }
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
