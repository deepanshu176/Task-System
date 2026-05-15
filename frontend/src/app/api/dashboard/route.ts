import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/auth-server';
import { connectDB } from '@/lib/db';
import { getCachedData } from '@/lib/redis';

export async function GET(request: NextRequest) {
  try {
    const { user, error, status } = await authenticateRequest(request);
    if (error || !user) {
      return NextResponse.json({ success: false, message: error || 'Unauthorized' }, { status: status || 401 });
    }

    const isAdmin = user.role === 'ADMIN';
    const cacheKey = `dashboard_stats:${user._id}`;

    const stats = await getCachedData(cacheKey, async () => {
      const db = await connectDB();
      const userId = user._id;

      // Parallel execution of all count operations
      const [totalProjects, totalTasks, completedTasks, activeProjects] = await Promise.all([
        db.collection('projects').countDocuments(isAdmin ? {} : { 
          $or: [{ creatorId: userId }, { members: { $in: [userId] } }] 
        }),
        db.collection('tasks').countDocuments(isAdmin ? {} : { 
          $or: [
            { creatorId: userId }, 
            { assigneeId: userId }, 
            { assigneeIds: { $in: [userId] } }
          ] 
        }),
        db.collection('tasks').countDocuments(isAdmin ? { status: 'COMPLETED' } : { 
          $and: [
            { status: 'COMPLETED' },
            { $or: [
              { creatorId: userId }, 
              { assigneeId: userId }, 
              { assigneeIds: { $in: [userId] } }
            ]}
          ]
        }),
        db.collection('projects').countDocuments(isAdmin ? { status: { $ne: 'COMPLETED' } } : { 
          $and: [
            { status: { $ne: 'COMPLETED' } },
            { $or: [{ creatorId: userId }, { members: { $in: [userId] } }] }
          ]
        })
      ]);

      return {
        totalProjects,
        totalTasks,
        pendingTasks: totalTasks - completedTasks,
        completedTasks,
        activeProjects,
        lastUpdated: new Date()
      };
    }, 30); // Cache for 30 seconds to balance freshness and speed

    return NextResponse.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error fetching dashboard:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}

