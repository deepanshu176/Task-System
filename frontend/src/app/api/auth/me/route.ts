import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/auth-server';

export async function GET(request: NextRequest) {
  try {
    const { user, error, status } = await authenticateRequest(request);
    
    if (error || !user) {
      return NextResponse.json(
        { success: false, message: error || 'Unauthorized' },
        { status: status || 401 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          role: user.role || 'MEMBER',
          permissions: user.permissions || [],
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

