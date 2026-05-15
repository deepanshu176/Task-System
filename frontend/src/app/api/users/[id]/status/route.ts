import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { authenticateRequest } from '@/lib/auth-server';
import { connectDB } from '@/lib/db';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { user, error } = await authenticateRequest(request);
    if (error || !user || user.role !== 'ADMIN') {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const { isActive } = await request.json();
    if (typeof isActive !== 'boolean') {
      return NextResponse.json({ success: false, message: 'Status is required' }, { status: 400 });
    }

    const db = await connectDB();
    const result = await db.collection('users').updateOne(
      { _id: new ObjectId(params.id) },
      { $set: { isActive, updatedAt: new Date() } }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ success: false, message: 'Member not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Status updated successfully' });
  } catch (error) {
    console.error('Error updating user status:', error);
    return NextResponse.json({ success: false, message: 'Failed to update status' }, { status: 500 });
  }
}
