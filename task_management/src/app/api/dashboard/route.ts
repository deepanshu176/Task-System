import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/auth-server';
import { connectDB } from '@/lib/db';
import { getCachedData } from '@/lib/redis';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { user, error, status } = await authenticateRequest(request);
    if (error || !user) {
      return NextResponse.json({ success: false, message: error || 'Unauthorized' }, { status: status || 401 });
    }

    const isAdmin = user.role === 'ADMIN';
    const cacheKey = `dashboard_stats:${user._id}`;

    if (typeof user._id === 'string' && user._id.startsWith('local-')) {
      return NextResponse.json({
        success: true,
        data: {
          totalProjects: 0,
          totalTasks: 0,
          pendingTasks: 0,
          completedTasks: 0,
          activeProjects: 0,
          lastUpdated: new Date()
        }
      });
    }

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

