import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/auth-server';
import { connectDB } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { user, error } = await authenticateRequest(request);
    
    if (error || !user) {
      return NextResponse.json(
        { success: false, message: error || 'Unauthorized' },
        { status: 401 }
      );
    }

    const db = await connectDB();
    const role = await db.collection('roles').findOne({ _id: user.roleId });

    return NextResponse.json(
      {
        success: true,
        data: {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          role: role?.name || 'MEMBER',
          isActive: user.isActive
        }
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get me error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
