import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import { ObjectId } from 'mongodb';
import { authenticateRequest } from '@/lib/auth-server';
import { connectDB } from '@/lib/db';

const BCRYPT_ROUNDS = 10;

export async function GET(request: NextRequest) {
  try {
    const { user, error } = await authenticateRequest(request);
    if (error || !user) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '100');
    const skip = parseInt(searchParams.get('skip') || '0');

    const db = await connectDB();
    
    // Use an optimized aggregation pipeline
    const users = await db.collection('users').aggregate([
      { $skip: skip },
      { $limit: limit },
      {
        $lookup: {
          from: 'roles',
          localField: 'roleId',
          foreignField: '_id',
          as: 'role'
        }
      },
      {
        $unwind: {
          path: '$role',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $project: {
          password: 0,
          loginAttempts: 0,
          lastLoginAttempt: 0
        }
      },
      {
        $addFields: {
          roleName: { $ifNull: ['$role.name', 'MEMBER'] }
        }
      },
      { $project: { role: 0 } }
    ]).toArray();

    return NextResponse.json({ success: true, data: users });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { user, error } = await authenticateRequest(request);
    if (error || !user || user.role !== 'ADMIN') {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const { name, email, password, roleId } = await request.json();
    if (!name || !email || !password || !roleId) {
      return NextResponse.json(
        { success: false, message: 'Name, email, password, and role are required' },
        { status: 400 }
      );
    }

    const db = await connectDB();
    const normalizedEmail = String(email).toLowerCase();
    const existingUser = await db.collection('users').findOne({ email: normalizedEmail });
    if (existingUser) {
      return NextResponse.json({ success: false, message: 'Email already registered' }, { status: 409 });
    }

    const role = await db.collection('roles').findOne({ _id: new ObjectId(roleId) });
    if (!role) {
      return NextResponse.json({ success: false, message: 'Role not found' }, { status: 404 });
    }

    const newUser = {
      name,
      email: normalizedEmail,
      password: await bcrypt.hash(password, BCRYPT_ROUNDS),
      roleId: new ObjectId(roleId),
      isActive: true,
      loginAttempts: 0,
      lastLoginAttempt: null,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await db.collection('users').insertOne(newUser);

    return NextResponse.json(
      { success: true, data: { _id: result.insertedId, ...newUser, password: undefined } },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json({ success: false, message: 'Failed to create member' }, { status: 500 });
  }
}

