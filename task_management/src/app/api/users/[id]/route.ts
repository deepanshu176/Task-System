import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import { ObjectId } from 'mongodb';
import { authenticateRequest } from '@/lib/auth-server';
import { connectDB } from '@/lib/db';

const BCRYPT_ROUNDS = 10;

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { user, error } = await authenticateRequest(request);
    if (error || !user || user.role !== 'ADMIN') {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const { name, email, password, roleId } = await request.json();
    const updateData: Record<string, unknown> = { updatedAt: new Date() };

    if (name) updateData.name = name;
    if (email) updateData.email = String(email).toLowerCase();
    if (roleId) updateData.roleId = new ObjectId(roleId);
    if (password) updateData.password = await bcrypt.hash(password, BCRYPT_ROUNDS);

    const db = await connectDB();
    const result = await db.collection('users').updateOne(
      { _id: new ObjectId(params.id) },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ success: false, message: 'Member not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Member updated successfully' });
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json({ success: false, message: 'Failed to update member' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { user, error } = await authenticateRequest(request);
    if (error || !user || user.role !== 'ADMIN') {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    if (params.id === String(user._id)) {
      return NextResponse.json({ success: false, message: 'You cannot delete your own account' }, { status: 400 });
    }

    const db = await connectDB();
    const result = await db.collection('users').deleteOne({ _id: new ObjectId(params.id) });

    if (result.deletedCount === 0) {
      return NextResponse.json({ success: false, message: 'Member not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Member removed successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json({ success: false, message: 'Failed to remove member' }, { status: 500 });
  }
}
