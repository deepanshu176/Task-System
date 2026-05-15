"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useEffect, useState } from "react";
import useSWR from "swr";
import api from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import toast from "react-hot-toast";
import { Plus, Calendar, Edit2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";

const fetcher = (url: string) => api.get(url).then(res => res.data.data || res.data);

const columns = [
  { id: 'TODO', title: 'To Do', color: 'bg-gray-100', dot: 'bg-gray-400' },
  { id: 'IN_PROGRESS', title: 'In Progress', color: 'bg-blue-50', dot: 'bg-blue-500' },
  { id: 'COMPLETED', title: 'Done', color: 'bg-green-50', dot: 'bg-green-500' }
];

const getTaskAssignees = (task: any) => {
  const assignees = task.assignees?.map((assignee: any) => assignee.user).filter(Boolean) || [];
  if (assignees.length > 0) return assignees;
  return task.assignee ? [task.assignee] : [];
};

export default function TasksPage() {
  const user = useAuthStore(state => state.user);
  
  const [draggedTask, setDraggedTask] = useState<string | null>(null);
  const [isModalOpen, setModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [selectedProjectId, setSelectedProjectId] = useState('all');

  const taskUrl = selectedProjectId === 'all' ? '/tasks' : `/tasks?projectId=${selectedProjectId}`;
  const { data: tasksData, mutate } = useSWR(taskUrl, fetcher, {
    keepPreviousData: true,
    revalidateOnFocus: false,
    dedupingInterval: 30000
  });
  const { data: projectsData } = useSWR('/projects', fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 30000
  });
  const tasks = tasksData || [];
  const projects = Array.isArray(projectsData) ? projectsData : projectsData?.data || [];

  const canCreate = user?.permissions?.includes('CREATE_TASK') || user?.role === 'ADMIN';
  const canEdit = user?.permissions?.includes('EDIT_TASK') || user?.role === 'ADMIN';
  const canDelete = user?.permissions?.includes('DELETE_TASK') || user?.role === 'ADMIN';

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    setDraggedTask(taskId);
    e.dataTransfer.effectAllowed = 'move';
    e.currentTarget.classList.add('opacity-50');
  };

  const handleDragEnd = (e: React.DragEvent) => {
    setDraggedTask(null);
    e.currentTarget.classList.remove('opacity-50');
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e: React.DragEvent, status: string) => {
    e.preventDefault();
    if (!draggedTask) return;

    const task = tasks.find((t: any) => t.id === draggedTask);
    if (task?.status === status) return;

    if (!canEdit) {
      toast.error('You do not have permission to edit tasks');
      return;
    }

    const prevTasks = [...tasks];
    mutate(tasks.map((t: any) => t.id === draggedTask ? { ...t, status } : t), false);

    try {
      await api.put(`/tasks/${draggedTask}`, { status });
      mutate();
      toast.success('Task status updated');
    } catch {
      mutate(prevTasks, false);
      toast.error('Failed to update task');
    }
    setDraggedTask(null);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this task?')) return;
    try {
      await api.delete(`/tasks/${id}`);
      mutate();
      toast.success('Task deleted');
    } catch {
      toast.error('Failed to delete task');
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900">Task Board</h2>
          <p className="text-gray-500 mt-1">Manage your team&apos;s tasks and workflows.</p>
        </div>
        <div className="flex gap-3">
          <select
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
            className="h-10 min-w-52 rounded-md border border-gray-200 bg-white px-3 text-sm font-medium text-gray-900 outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Projects</option>
            {projects.map((project: any) => (
              <option key={project.id} value={project.id}>{project.name}</option>
            ))}
          </select>
          {canCreate && (
            <Button
              onClick={() => {
                setSelectedTask(selectedProjectId === 'all' ? null : { projectId: selectedProjectId });
                setModalOpen(true);
              }}
              className="bg-blue-600 hover:bg-blue-700 shadow-md"
            >
              <Plus className="w-4 h-4 mr-2" /> New Task
            </Button>
          )}
        </div>
      </div>

      <div className="flex gap-6 overflow-x-auto pb-4 flex-1 items-start">
        {columns.map(column => (
          <div 
            key={column.id} 
            className={`${column.color} rounded-2xl w-80 flex-shrink-0 flex flex-col border border-gray-200/50 max-h-full`}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, column.id)}
          >
            <div className="p-4 flex items-center justify-between border-b border-gray-200/50">
              <div className="flex items-center gap-2">
                <div className={`w-2.5 h-2.5 rounded-full ${column.dot}`}></div>
                <h3 className="font-semibold text-gray-800">{column.title}</h3>
                <span className="bg-white/60 text-gray-500 text-xs font-bold px-2 py-0.5 rounded-full ml-2">
                  {tasks.filter((t: any) => t.status === column.id).length}
                </span>
              </div>
              {canCreate && (
                <button
                  onClick={() => {
                    setSelectedTask({
                      status: column.id,
                      projectId: selectedProjectId === 'all' ? '' : selectedProjectId
                    });
                    setModalOpen(true);
                  }}
                  className="text-gray-400 hover:text-gray-700 p-1 rounded-md hover:bg-white/50 transition"
                >
                  <Plus className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="flex-1 p-3 space-y-3 overflow-y-auto">
              {tasks.filter((t: any) => t.status === column.id).map((task: any) => (
                <div
                  key={task._id}
                  draggable={canEdit}
                  onDragStart={(e) => handleDragStart(e, task._id)}}
                  onDragEnd={handleDragEnd}
                  className={`bg-white p-4 rounded-xl shadow-sm border border-gray-200 transition-all group ${canEdit ? 'cursor-grab active:cursor-grabbing hover:border-blue-300 hover:shadow-md' : ''}`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex gap-2 mb-2">
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                        task.priority === 'HIGH' ? 'bg-red-50 text-red-600 border border-red-100' :
                        task.priority === 'MEDIUM' ? 'bg-orange-50 text-orange-600 border border-orange-100' :
                        'bg-blue-50 text-blue-600 border border-blue-100'
                      }`}>
                        {task.priority}
                      </span>
                    </div>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                      {canEdit && (
                        <button onClick={() => { setSelectedTask(task); setModalOpen(true); }} className="p-1 hover:bg-blue-50 text-gray-400 hover:text-blue-600 rounded">
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                      {canDelete && (
                        <button onClick={() => handleDelete(task._id)} className="p-1 hover:bg-red-50 text-gray-400 hover:text-red-600 rounded">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  <h4 className="font-medium text-gray-900 leading-tight mb-2">{task.title}</h4>
                  {task.project?.name && (
                    <p className="text-[11px] font-semibold text-blue-600 mb-2 truncate">{task.project.name}</p>
                  )}
                  
                  {task.description && (
                    <p className="text-xs text-gray-500 line-clamp-2 mb-4 leading-relaxed">{task.description}</p>
                  )}

                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium bg-gray-50 px-2 py-1 rounded-md border border-gray-100">
                      <Calendar className="w-3.5 h-3.5 text-gray-400" />
                      {task.dueDate ? new Date(task.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : 'No date'}
                    </div>

                    <div className="flex -space-x-2">
                      {getTaskAssignees(task).slice(0, 3).map((assignee: any) => (
                        <div key={assignee.id} className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold ring-2 ring-white shadow-sm" title={assignee.name}>
                          {assignee.name?.charAt(0).toUpperCase()}
                        </div>
                      ))}
                      {getTaskAssignees(task).length > 3 && (
                        <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 text-[10px] font-bold ring-2 ring-white shadow-sm">
                          +{getTaskAssignees(task).length - 3}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {tasks.filter((t: any) => t.status === column.id).length === 0 && (
                <div className="rounded-xl border border-dashed border-gray-200 bg-white/50 p-4 text-center text-sm text-gray-400">
                  No tasks
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <CreateEditTaskModal 
        isOpen={isModalOpen}
        onClose={() => setModalOpen(false)}
        task={selectedTask}
        projects={projects}
        onSuccess={() => mutate()}
      />
    </div>
  );
}

function CreateEditTaskModal({ isOpen, onClose, task, projects, onSuccess }: { isOpen: boolean, onClose: () => void, task: any, projects: any[], onSuccess: () => void }) {
  const [loading, setLoading] = useState(false);
  const { data: users } = useSWR(isOpen ? '/users?limit=100' : null, fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 30000
  });

  const [formData, setFormData] = useState({
    title: task?.title || '',
    description: task?.description || '',
    status: task?.status || 'TODO',
    priority: task?.priority || 'MEDIUM',
    projectId: task?.projectId || '',
    assigneeIds: task?.assignees?.map((assignee: any) => assignee.userId) || (task?.assigneeId ? [task.assigneeId] : [])
  });

  useEffect(() => {
    if (!isOpen) return;

    setFormData({
      title: task?.title || '',
      description: task?.description || '',
      status: task?.status || 'TODO',
      priority: task?.priority || 'MEDIUM',
      projectId: task?.projectId || '',
      assigneeIds: task?.assignees?.map((assignee: any) => assignee.userId) || (task?.assigneeId ? [task.assigneeId] : [])
    });
  }, [isOpen, task]);

  const toggleAssignee = (userId: string) => {
    const isSelected = formData.assigneeIds.includes(userId);
    setFormData({
      ...formData,
      assigneeIds: isSelected
        ? formData.assigneeIds.filter((id: string) => id !== userId)
        : [...formData.assigneeIds, userId]
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (task?.id) {
        await api.put(`/tasks/${task._id}`, formData);
        toast.success('Task updated');
      } else {
        await api.post('/tasks', formData);
        toast.success('Task created');
      }
      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to save task');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={task?.id ? 'Edit Task' : 'Create Task'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Task Title</label>
          <Input 
            value={formData.title}
            onChange={(e) => setFormData({...formData, title: e.target.value})}
            placeholder="What needs to be done?"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea 
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
            className="w-full border border-gray-300 rounded-md p-2 outline-none focus:ring-2 focus:ring-blue-600 min-h-[80px]"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Status</label>
            <select 
              value={formData.status}
              onChange={(e) => setFormData({...formData, status: e.target.value})}
              className="w-full border border-gray-300 rounded-md p-2 outline-none"
            >
              <option value="TODO">To Do</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="COMPLETED">Done</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Priority</label>
            <select 
              value={formData.priority}
              onChange={(e) => setFormData({...formData, priority: e.target.value})}
              className="w-full border border-gray-300 rounded-md p-2 outline-none"
            >
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
            </select>
          </div>
        </div>

        <div>
          <div>
            <label className="block text-sm font-medium mb-1">Project</label>
            <select 
              value={formData.projectId}
              onChange={(e) => setFormData({...formData, projectId: e.target.value})}
              className="w-full border border-gray-300 rounded-md p-2 outline-none"
              required
            >
              <option value="">Select Project</option>
              {projects.map((p: any) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Assignees</label>
          <div className="grid grid-cols-2 gap-2 max-h-36 overflow-y-auto rounded-md border border-gray-200 bg-gray-50/50 p-2">
            {(users?.data || []).length === 0 ? (
              <p className="col-span-2 px-1 py-2 text-sm text-gray-500">No users available.</p>
            ) : (users?.data || []).map((u: any) => {
              const isSelected = formData.assigneeIds.includes(u.id);
              return (
                <label key={u.id} className="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-sm hover:bg-white">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleAssignee(u.id)}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="truncate">{u.name}</span>
                </label>
              );
            })}
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="submit" disabled={loading}>{loading ? 'Saving...' : 'Save Task'}</Button>
        </div>
      </form>
    </Modal>
  );
}
