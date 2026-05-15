import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/jwt-server';
import { connectDB } from '@/lib/db';
import { ObjectId } from 'mongodb';

export async function authenticateRequest(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { user: null, error: 'Missing or invalid authorization header' };
  }

  const token = authHeader.substring(7);
  const payload = verifyToken(token);
  
  if (!payload) {
    return { user: null, error: 'Invalid or expired token' };
  }

  try {
    const db = await connectDB();
    const user = await db.collection('users').findOne({ 
      _id: new ObjectId(payload.userId) 
    });

    if (!user) {
      return { user: null, error: 'User not found' };
    }

    return { user, error: null };
  } catch (error) {
    return { user: null, error: 'Database error' };
  }
}
