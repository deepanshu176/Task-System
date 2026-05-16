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

    const { roleId } = await request.json();
    if (!roleId) {
      return NextResponse.json({ success: false, message: 'Role is required' }, { status: 400 });
    }

    const db = await connectDB();
    const role = await db.collection('roles').findOne({ _id: new ObjectId(roleId) });
    if (!role) {
      return NextResponse.json({ success: false, message: 'Role not found' }, { status: 404 });
    }

    const result = await db.collection('users').updateOne(
      { _id: new ObjectId(params.id) },
      { $set: { roleId: new ObjectId(roleId), updatedAt: new Date() } }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ success: false, message: 'Member not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Role updated successfully' });
  } catch (error) {
    console.error('Error updating user role:', error);
    return NextResponse.json({ success: false, message: 'Failed to update role' }, { status: 500 });
  }
}
