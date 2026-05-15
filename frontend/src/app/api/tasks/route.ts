import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/auth-server';
import { connectDB } from '@/lib/mongodb';
import { getCachedData, invalidateCache } from '@/lib/redis';
import { Document, Filter, ObjectId } from 'mongodb';

export async function GET(request: NextRequest) {
  try {
    const { user, error, status } = await authenticateRequest(request);
    if (error || !user) {
      return NextResponse.json({ success: false, message: error || 'Unauthorized' }, { status: status || 401 });
    }

    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');

    const cacheKey = `tasks:${user._id}:${projectId || 'all'}`;
    
    const tasks = await getCachedData(cacheKey, async () => {
      const db = await connectDB();
      const query: Filter<Document> = {};
      
      if (user.role !== 'ADMIN') {
        const userIdString = user._id.toString();
        query.$or = [
          { creatorId: user._id },
          { assigneeId: user._id },
          { assigneeIds: { $in: [user._id] } },
          // Also check for string versions just in case they were stored as strings
          { creatorId: userIdString },
          { assigneeId: userIdString },
          { assigneeIds: { $in: [userIdString] } }
        ];
      }

      if (projectId && projectId !== 'all') {
        try {
          query.projectId = new ObjectId(projectId);
        } catch {
          query.projectId = projectId; // Fallback to string if not a valid ObjectId
        }
      }

      return await db.collection('tasks')
        .find(query)
        .project({ title: 1, description: 1, status: 1, priority: 1, dueDate: 1, assignees: 1, assigneeIds: 1, projectId: 1, creatorId: 1, createdAt: 1, updatedAt: 1 })
        .sort({ createdAt: -1 })
        .toArray();
    }, 60); // Cache for 60 seconds

    return NextResponse.json({ success: true, data: tasks });
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { user, error, status } = await authenticateRequest(request);
    if (error || !user) {
      return NextResponse.json({ success: false, message: error || 'Unauthorized' }, { status: status || 401 });
    }

    const { projectId, assigneeIds, ...rest } = await request.json();
    const db = await connectDB();

    const task = {
      ...rest,
      projectId: projectId ? new ObjectId(projectId) : null,
      assigneeIds: Array.isArray(assigneeIds) ? assigneeIds.map((id: string) => new ObjectId(id)) : [],
      creatorId: user._id,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await db.collection('tasks').insertOne(task);
    
    // Invalidate relevant caches
    await invalidateCache(`tasks:${user._id}:all`);
    if (projectId) await invalidateCache(`tasks:${user._id}:${projectId}`);

    return NextResponse.json(
      { success: true, data: { _id: result.insertedId, ...task } },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating task:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}
