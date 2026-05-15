"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useEffect, useState } from "react";
import useSWR from "swr";
import api from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import toast from "react-hot-toast";
import { Plus, CheckSquare, Edit2, Trash2, FolderKanban } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";

const fetcher = (url: string) => api.get(url).then(res => res.data.data || res.data);

export default function ProjectsPage() {
  const { data: projects, mutate, isLoading } = useSWR('/projects', fetcher);
  const user = useAuthStore(state => state.user);
  
  const [isModalOpen, setModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<any>(null);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this project?')) return;
    try {
      await api.delete(`/projects/${id}`);
      mutate();
      toast.success('Project deleted');
    } catch {
      toast.error('Failed to delete project');
    }
  };

  if (isLoading) return <div className="p-8 flex justify-center text-gray-500">Loading projects...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900">Projects</h2>
          <p className="text-gray-500 mt-1">Manage and track your team&apos;s projects.</p>
        </div>
        {(user?.permissions?.includes('CREATE_PROJECT') || user?.role === 'ADMIN') && (
          <Button onClick={() => { setSelectedProject(null); setModalOpen(true); }} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" /> New Project
          </Button>
        )}
      </div>

      {projects?.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-2xl p-12 flex flex-col items-center justify-center text-center shadow-sm">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
            <FolderKanban className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-1">No projects yet</h3>
          <p className="text-gray-500 mb-6">Get started by creating your first project.</p>
          {(user?.permissions?.includes('CREATE_PROJECT') || user?.role === 'ADMIN') && (
            <Button onClick={() => { setSelectedProject(null); setModalOpen(true); }}>
              Create Project
            </Button>
          )}
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {projects?.map((project: any) => {
            const totalTasks = project.tasks?.length || 0;
            const completedTasks = project.tasks?.filter((t: any) => t.status === 'COMPLETED').length || 0;
            const progress = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

            return (
              <div key={project._id} className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-all group overflow-hidden flex flex-col">
                <div className="p-6 flex-1">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex gap-2">
                      <span className={`px-2.5 py-1 rounded-md text-xs font-semibold ${
                        project.status === 'COMPLETED' ? 'bg-green-50 text-green-700' :
                        project.status === 'IN_PROGRESS' ? 'bg-blue-50 text-blue-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {project.status.replace('_', ' ')}
                      </span>
                    </div>
                    {(user?.permissions?.includes('EDIT_PROJECT') || user?.role === 'ADMIN') && (
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => { setSelectedProject(project); setModalOpen(true); }} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(project._id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>

                  <h3 className="text-lg font-bold text-gray-900 mb-2">{project.name}</h3>
                  <p className="text-sm text-gray-500 line-clamp-2 mb-6">{project.description || 'No description provided.'}</p>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium text-gray-700">Progress</span>
                      <span className="font-bold text-gray-900">{progress}%</span>
                    </div>
                    <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-600 rounded-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
                    </div>
                  </div>
                </div>

                <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-sm text-gray-500 font-medium">
                    <CheckSquare className="w-4 h-4" />
                    {completedTasks}/{totalTasks} tasks
                  </div>
                  <div className="flex -space-x-2 overflow-hidden">
                    {project.members?.slice(0, 3).map((m: any) => (
                      <div key={m.userId} className="inline-block h-8 w-8 rounded-full ring-2 ring-white bg-gradient-to-tr from-blue-500 to-indigo-500 flex items-center justify-center text-white text-xs font-bold" title={m.user.name}>
                        {m.user.name?.charAt(0).toUpperCase()}
                      </div>
                    ))}
                    {(project.members?.length || 0) > 3 && (
                      <div className="inline-block h-8 w-8 rounded-full ring-2 ring-white bg-gray-100 flex items-center justify-center text-gray-600 text-xs font-bold">
                        +{project.members.length - 3}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <CreateEditProjectModal 
        isOpen={isModalOpen}
        onClose={() => setModalOpen(false)}
        project={selectedProject}
        onSuccess={() => mutate()}
      />
    </div>
  );
}

function CreateEditProjectModal({ isOpen, onClose, project, onSuccess }: { isOpen: boolean, onClose: () => void, project: any, onSuccess: () => void }) {
  const [loading, setLoading] = useState(false);
  const { data: usersData } = useSWR('/users?limit=100', fetcher);
  const users = usersData?.data || [];
  
  const [formData, setFormData] = useState({
    name: project?.name || '',
    description: project?.description || '',
    status: project?.status || 'TODO',
    memberIds: project?.members?.map((m: any) => m.userId) || []
  });

  useEffect(() => {
    if (!isOpen) return;

    setFormData({
      name: project?.name || '',
      description: project?.description || '',
      status: project?.status || 'TODO',
      memberIds: project?.members?.map((m: any) => m.userId) || []
    });
  }, [isOpen, project]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (project) {
        await api.put(`/projects/${project._id}`, formData);
        toast.success('Project updated');
      } else {
        await api.post('/projects', formData);
        toast.success('Project created');
      }
      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to save project');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={project ? 'Edit Project' : 'Create Project'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Project Name</label>
          <Input 
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            placeholder="e.g., Q3 Marketing Campaign"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea 
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
            className="w-full border border-gray-300 rounded-md p-2 outline-none focus:ring-2 focus:ring-blue-600 min-h-[100px]"
            placeholder="What is this project about?"
          />
        </div>
        {project && (
          <div>
            <label className="block text-sm font-medium mb-1">Status</label>
            <select 
              value={formData.status}
              onChange={(e) => setFormData({...formData, status: e.target.value})}
              className="w-full border border-gray-300 rounded-md p-2 outline-none focus:ring-2 focus:ring-blue-600"
            >
              <option value="TODO">To Do</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="COMPLETED">Completed</option>
            </select>
          </div>
        )}
        
        <div>
          <label className="block text-sm font-medium mb-1">Assign Members</label>
          <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto p-2 border border-gray-200 rounded-md bg-gray-50/50">
            {users.length === 0 ? (
              <p className="col-span-2 text-sm text-gray-500 px-1 py-2">No users available.</p>
            ) : users.map((u: any) => {
              const isSelected = formData.memberIds.includes(u.id);
              return (
                <label key={u.id} className="flex items-center space-x-2 text-sm cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={isSelected}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setFormData({...formData, memberIds: [...formData.memberIds, u.id]});
                      } else {
                        setFormData({...formData, memberIds: formData.memberIds.filter((id: string) => id !== u.id)});
                      }
                    }}
                    className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                  />
                  <span>{u.name}</span>
                </label>
              );
            })}
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="submit" disabled={loading}>{loading ? 'Saving...' : 'Save Project'}</Button>
        </div>
      </form>
    </Modal>
  );
}
