"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useEffect, useState } from "react";
import useSWR from "swr";
import api from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import toast from "react-hot-toast";
import { Plus, Calendar, Edit2, Trash2, Zap, MoreHorizontal, Filter, Clock, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const fetcher = (url: string) => api.get(url).then(res => res.data.data || res.data);

const columns = [
  { id: 'TODO', title: 'To Do', color: 'bg-white/5', dot: 'bg-slate-400' },
  { id: 'IN_PROGRESS', title: 'In Progress', color: 'bg-lumina-primary/5', dot: 'bg-lumina-primary' },
  { id: 'COMPLETED', title: 'Done', color: 'bg-emerald-500/5', dot: 'bg-emerald-500' }
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
  const { data: tasksData, mutate } = useSWR(taskUrl, fetcher);
  const { data: projectsData } = useSWR('/projects', fetcher);
  
  const tasks = tasksData || [];
  const projects = Array.isArray(projectsData) ? projectsData : projectsData?.data || [];

  const handleDragStart = (taskId: string) => setDraggedTask(taskId);
  const handleDrop = async (status: string) => {
    if (!draggedTask) return;
    const task = tasks.find((t: any) => t._id === draggedTask);
    if (task?.status === status) return;

    const prevTasks = [...tasks];
    mutate(tasks.map((t: any) => t._id === draggedTask ? { ...t, status } : t), false);

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
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-4xl font-black tracking-tight text-slate-900">Tasks</h2>
          <p className="text-slate-500 mt-1 font-medium italic">High-velocity Kanban board for team operations.</p>
        </div>
        <div className="flex items-center gap-4">
          <select
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
            className="h-11 min-w-[200px] px-4 rounded-xl border border-slate-100 bg-white text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-600/10 transition-all"
          >
            <option value="all">All Projects</option>
            {projects.map((p: any) => <option key={p._id} value={p._id}>{p.name}</option>)}
          </select>
          {user?.role === 'ADMIN' && (
            <Button onClick={() => { setSelectedTask(null); setModalOpen(true); }} className="bg-blue-600 hover:bg-blue-700 text-white font-black h-11 px-6 rounded-xl shadow-lg shadow-blue-600/20 flex items-center gap-2 transition-all">
              <Plus className="w-5 h-5" /> New Task
            </Button>
          )}
        </div>
      </div>

      <div className="flex gap-6 overflow-x-auto pb-10 flex-1 items-start no-scrollbar">
        {columns.map(column => (
          <div
            key={column.id}
            className={cn("w-[340px] flex-shrink-0 flex flex-col rounded-[2.5rem] bg-slate-50 border border-slate-100 shadow-sm max-h-full transition-all")}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => handleDrop(column.id)}
          >
            <div className="p-6 flex items-center justify-between border-b border-slate-100/50">
              <div className="flex items-center gap-3">
                <div className={cn("w-2 h-2 rounded-full", column.dot)}></div>
                <h3 className="font-black text-[10px] uppercase tracking-widest text-slate-400">{column.title}</h3>
                <span className="text-[10px] font-black text-blue-600 px-2 py-0.5 bg-blue-50 border border-blue-100 rounded-full">{tasks.filter((t: any) => t.status === column.id).length}</span>
              </div>
            </div>

            <div className="flex-1 p-4 space-y-4 overflow-y-auto min-h-[500px]">
              {tasks.filter((t: any) => t.status === column.id).map((task: any) => (
                <div
                  key={task._id}
                  draggable
                  onDragStart={() => handleDragStart(task._id)}
                  className="bg-white p-6 group border border-slate-100 rounded-2xl shadow-sm cursor-grab active:cursor-grabbing hover:shadow-md hover:border-blue-600/10 transition-all"
                >
                  <div className="flex justify-between items-start mb-4">
                    <span className={cn(
                      "text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg border",
                      task.priority === 'HIGH' ? 'bg-rose-50 text-rose-600 border-rose-100' :
                      task.priority === 'MEDIUM' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                      'bg-blue-50 text-blue-600 border-blue-100'
                    )}>
                      {task.priority}
                    </span>
                    {user?.role === 'ADMIN' && (
                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                        <button onClick={() => { setSelectedTask(task); setModalOpen(true); }} className="p-1.5 hover:bg-slate-50 rounded-lg text-slate-400 hover:text-blue-600 transition-colors"><Edit2 className="w-3.5 h-3.5" /></button>
                        <button onClick={() => handleDelete(task._id)} className="p-1.5 hover:bg-rose-50 rounded-lg text-slate-400 hover:text-rose-500 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    )}
                  </div>

                  <h4 className="font-bold text-base mb-2 text-slate-900 leading-tight">{task.title}</h4>
                  <p className="text-xs text-slate-500 line-clamp-2 mb-6 italic font-medium leading-relaxed">{task.description}</p>

                  <div className="flex items-center justify-between pt-5 border-t border-slate-50">
                    <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-slate-300">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{task.dueDate ? new Date(task.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : 'No date'}</span>
                    </div>
                    <div className="flex -space-x-2">
                       {getTaskAssignees(task).slice(0, 3).map((assignee: any) => (
                         <div key={assignee._id} className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-[10px] font-black text-white ring-4 ring-white shadow-sm">
                           {assignee.name?.charAt(0).toUpperCase()}
                         </div>
                       ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <CreateEditTaskModal isOpen={isModalOpen} onClose={() => setModalOpen(false)} task={selectedTask} projects={projects} onSuccess={() => mutate()} />
    </div>
  );
}

function CreateEditTaskModal({ isOpen, onClose, task, projects, onSuccess }: { isOpen: boolean, onClose: () => void, task: any, projects: any[], onSuccess: () => void }) {
  const [loading, setLoading] = useState(false);
  const { data: usersData } = useSWR(isOpen ? '/users?limit=100' : null, fetcher);
  const users = Array.isArray(usersData) ? usersData : usersData?.data || [];
  const [formData, setFormData] = useState({ title: '', description: '', status: 'TODO', priority: 'MEDIUM', projectId: '', assigneeIds: [] as string[] });

  useEffect(() => {
    if (isOpen) {
      setFormData({
        title: task?.title || '',
        description: task?.description || '',
        status: task?.status || 'TODO',
        priority: task?.priority || 'MEDIUM',
        projectId: task?.projectId || '',
        assigneeIds: task?.assignees?.map((a: any) => a.userId) || []
      });
    }
  }, [isOpen, task]);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (task?._id) await api.put(`/tasks/${task._id}`, formData);
      else await api.post('/tasks', formData);
      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to save task');
    } finally {
      setLoading(false);
    }
  };

  const toggleAssignee = (userId: string) => {
    setFormData(prev => ({
      ...prev,
      assigneeIds: prev.assigneeIds.includes(userId) ? prev.assigneeIds.filter(id => id !== userId) : [...prev.assigneeIds, userId]
    }));
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={task?._id ? 'Edit Task' : 'New Task'}>
      <form onSubmit={handleSubmit} className="space-y-8">
        <div>
          <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2.5 ml-1">Title</label>
          <Input 
            value={formData.title} 
            onChange={(e) => setFormData({...formData, title: e.target.value})} 
            placeholder="Task title..." 
            required 
            className="h-14 bg-slate-50 border-slate-100 rounded-2xl focus:border-blue-600 focus:ring-0 transition-all font-medium"
          />
        </div>
        <div>
          <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2.5 ml-1">Description</label>
          <textarea 
            value={formData.description} 
            onChange={(e) => setFormData({...formData, description: e.target.value})} 
            className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-5 outline-none text-sm min-h-[120px] focus:border-blue-600 transition-all font-medium placeholder:text-slate-300" 
            placeholder="What needs to be done?" 
          />
        </div>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2.5 ml-1">Status</label>
            <select value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})} className="w-full bg-slate-50 border border-slate-100 rounded-2xl h-14 px-5 text-sm font-bold text-slate-900 outline-none focus:border-blue-600 transition-all appearance-none">
              <option value="TODO">To Do</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="COMPLETED">Done</option>
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2.5 ml-1">Priority</label>
            <select value={formData.priority} onChange={(e) => setFormData({...formData, priority: e.target.value})} className="w-full bg-slate-50 border border-slate-100 rounded-2xl h-14 px-5 text-sm font-bold text-slate-900 outline-none focus:border-blue-600 transition-all appearance-none">
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
            </select>
          </div>
        </div>
        <div>
          <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2.5 ml-1">Project</label>
          <select value={formData.projectId} onChange={(e) => setFormData({...formData, projectId: e.target.value})} className="w-full bg-slate-50 border border-slate-100 rounded-2xl h-14 px-5 text-sm font-bold text-slate-900 outline-none focus:border-blue-600 transition-all appearance-none" required>
            <option value="">Select Project</option>
            {projects.map((p: any) => <option key={p._id} value={p._id}>{p.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2.5 ml-1">Assign Team</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-60 overflow-y-auto p-4 border border-slate-100 rounded-[2rem] bg-slate-50 no-scrollbar">
            {users.map((u: any) => (
              <label key={u._id} className={cn(
                "flex items-center gap-3 p-3 rounded-xl transition-all cursor-pointer group border",
                formData.assigneeIds.includes(u._id) ? "bg-white border-blue-600/20 shadow-sm" : "bg-transparent border-transparent hover:bg-white"
              )}>
                <div className="relative">
                  <input type="checkbox" checked={formData.assigneeIds.includes(u._id)} onChange={() => toggleAssignee(u._id)} className="peer absolute opacity-0" />
                  <div className="w-5 h-5 rounded-lg border-2 border-slate-200 flex items-center justify-center transition-all peer-checked:bg-blue-600 peer-checked:border-blue-600 group-hover:border-blue-600/30">
                    <CheckCircle2 className="w-3.5 h-3.5 text-white opacity-0 peer-checked:opacity-100" />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-[8px] font-black text-white">
                    {u.name?.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-xs font-black text-slate-700">{u.name}</span>
                </div>
              </label>
            ))}
          </div>
        </div>
        <div className="flex justify-end gap-4 pt-8 border-t border-slate-100">
          <button type="button" onClick={onClose} className="px-8 py-3.5 rounded-2xl text-xs font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-all">Cancel</button>
          <button type="submit" disabled={loading} className="px-10 py-3.5 bg-slate-900 text-white text-xs font-black uppercase tracking-widest rounded-2xl shadow-[0_20px_40px_rgba(15,23,42,0.1)] hover:bg-slate-800 transition-all">{loading ? 'Saving...' : 'Save Task'}</button>
        </div>
      </form>
    </Modal>
  );
}
