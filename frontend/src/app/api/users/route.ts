import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/auth-server';
import { connectDB } from '@/lib/db';

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
          roleId: 0,
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

