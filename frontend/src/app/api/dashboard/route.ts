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

    const [totalProjects, totalTasks, completedTasks, activeProjects] = await Promise.all([
      db.collection('projects').countDocuments({ creatorId: user._id }),
      db.collection('tasks').countDocuments({ assigneeId: user._id }),
      db.collection('tasks').countDocuments({ assigneeId: user._id, status: 'COMPLETED' }),
      db.collection('projects').countDocuments({ creatorId: user._id, status: { $ne: 'COMPLETED' } })
    ]);

    const pendingTasks = totalTasks - completedTasks;

    return NextResponse.json({
      success: true,
      data: {
        totalTasks,
        pendingTasks,
        completedTasks,
        activeProjects,
        lastUpdated: new Date()
      }
    });
  } catch (error) {
    console.error('Error fetching dashboard:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}
