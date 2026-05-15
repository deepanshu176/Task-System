import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/auth-server';
import { connectDB } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { user, error } = await authenticateRequest(request);
    if (error || !user) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const db = await connectDB();
    const permissions = await db.collection('permissions').find({}).toArray();

    return NextResponse.json({ success: true, data: permissions });
  } catch (error) {
    console.error('Error fetching permissions:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}
