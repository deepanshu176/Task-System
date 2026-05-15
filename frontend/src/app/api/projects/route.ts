import { NextRequest, NextResponse } from 'next/server';
import { Document, Filter } from 'mongodb';
import { authenticateRequest } from '@/lib/auth-server';
import { connectDB } from '@/lib/db';
import { getCachedData, invalidateCache } from '@/lib/redis';

export async function GET(request: NextRequest) {
  try {
    const { user, error, status } = await authenticateRequest(request);
    if (error || !user) {
      return NextResponse.json({ success: false, message: error || 'Unauthorized' }, { status: status || 401 });
    }

    const cacheKey = `projects:${user._id}`;
    const projects = await getCachedData(cacheKey, async () => {
      const db = await connectDB();
      const query: Filter<Document> = {};

      // If not admin, only show projects where user is a member or creator
      if (user.role !== 'ADMIN') {
        query.$or = [
          { creatorId: user._id },
          { members: { $in: [user._id] } }
        ];
      }

      return await db.collection('projects')
        .find(query)
        .sort({ createdAt: -1 })
        .toArray();
    }, 60); // Cache for 60 seconds

    return NextResponse.json({ success: true, data: projects });
  } catch (error) {
    console.error('Error fetching projects:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { user, error, status } = await authenticateRequest(request);
    if (error || !user) {
      return NextResponse.json({ success: false, message: error || 'Unauthorized' }, { status: status || 401 });
    }

    const body = await request.json();
    const db = await connectDB();

    const project = {
      ...body,
      creatorId: user._id,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await db.collection('projects').insertOne(project);
    
    // Invalidate project cache for this user
    await invalidateCache(`projects:${user._id}`);
    
    return NextResponse.json(
      { success: true, data: { _id: result.insertedId, ...project } },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating project:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}
