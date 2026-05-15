import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();
    
    if (!email) {
      return NextResponse.json({ success: false, message: 'Email is required' }, { status: 400 });
    }

    const db = await connectDB();
    const user = await db.collection('users').findOne({ email });

    // For security, always return success even if user not found
    // This prevents email enumeration attacks
    return NextResponse.json({ 
      success: true, 
      message: 'If an account exists with this email, a reset link has been dispatched.' 
    });
  } catch (error) {
    console.error('Forgot Password error:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}
