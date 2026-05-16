import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/auth-server';
import { connectDB } from '@/lib/db';
import { ObjectId } from 'mongodb';

type Subtask = {
  title: string;
  status: 'TODO';
};

/**
 * AI Task Decomposition Route
 * This route simulates/implements the logic to break a complex task into actionable sub-tasks.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { user, error } = await authenticateRequest(request);
    if (error || !user) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const db = await connectDB();
    const task = await db.collection('tasks').findOne({ _id: new ObjectId(params.id) });

    if (!task) {
      return NextResponse.json({ success: false, message: 'Task not found' }, { status: 404 });
    }

    // Simulate AI Processing Delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // MOCK AI LOGIC: In a real scenario, this would call OpenAI/Anthropic
    // We generate sub-tasks based on the task title and description
    const subtasks = generateMockSubtasks(task.title);

    // Update the task with the new sub-tasks
    // We'll store them in a 'subtasks' field
    await db.collection('tasks').updateOne(
      { _id: new ObjectId(params.id) },
      { 
        $set: { 
          subtasks,
          aiDecomposed: true,
          updatedAt: new Date(),
          // Optionally update the description to reflect the breakdown
          description: task.description + '\n\n---\nAI BREAKDOWN:\n' + subtasks.map((s) => `- [ ] ${s.title}`).join('\n')
        } 
      }
    );

    return NextResponse.json({ 
      success: true, 
      message: 'Task decomposed by Lumina AI',
      data: { subtasks }
    });
  } catch (error) {
    console.error('Error in AI decomposition:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}

function generateMockSubtasks(title: string): Subtask[] {
  // Simple heuristic-based mock "AI"
  const items: Subtask[] = [
    { title: `Initialize ${title} infrastructure`, status: 'TODO' },
    { title: `Draft technical specifications for ${title}`, status: 'TODO' },
    { title: `Implement core logic for ${title.toLowerCase()}`, status: 'TODO' },
    { title: `Verify and sync ${title} metrics`, status: 'TODO' },
    { title: `Final review and deployment`, status: 'TODO' },
  ];
  
  return items;
}
