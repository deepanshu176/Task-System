"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState, useMemo } from "react";
import useSWR from "swr";
import api from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import toast from "react-hot-toast";
import { 
  Plus, 
  Search, 
  Users, 
  Edit2, 
  Trash2
} from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const fetcher = (url: string) => api.get(url).then(res => res.data.data || res.data);

export default function ProjectsPage() {
  const user = useAuthStore(state => state.user);
  const [search, setSearch] = useState("");
  const [isModalOpen, setModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<any>(null);

  const { data: projects, mutate: mutateProjects, isLoading } = useSWR('/projects', fetcher);
  const { data: users } = useSWR('/users', fetcher);

  const filteredProjects = useMemo(() => {
    if (!projects) return [];
    return projects.filter((p: any) => 
      p.name.toLowerCase().includes(search.toLowerCase()) || 
      p.description?.toLowerCase().includes(search.toLowerCase())
    );
  }, [projects, search]);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this project?')) return;
    try {
      await api.delete(`/projects/${id}`);
      mutateProjects();
      toast.success('Project deleted');
    } catch {
      toast.error('Failed to delete project');
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-4xl font-black tracking-tight text-[var(--foreground)]">Projects</h2>
          <p className="text-[var(--foreground)] opacity-40 mt-1 font-medium italic">Manage and track your operational projects.</p>
        </div>
        {user?.role === 'ADMIN' && (
          <Button 
            onClick={() => { setSelectedProject(null); setModalOpen(true); }} 
            className="bg-lumina-primary hover:bg-lumina-primary/90 text-white font-black h-12 px-6 rounded-xl shadow-lg transition-all flex items-center gap-2"
          >
            <Plus className="w-5 h-5" /> New Project
          </Button>
        )}
      </div>

      <div className="glass-card p-4 border-[var(--obsidian-border)] flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 opacity-20" />
          <Input 
            placeholder="Search projects..." 
            className="pl-10 bg-[var(--background)] border-[var(--obsidian-border)] h-11 rounded-lg text-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          <div className="col-span-full py-20 text-center opacity-20 font-bold uppercase tracking-widest">Loading Projects...</div>
        ) : filteredProjects.map((project: any) => (
          <div key={project._id} className="glass-card p-6 border-[var(--obsidian-border)] flex flex-col group">
            <div className="flex justify-between items-start mb-6">
              <div className="w-12 h-12 rounded-xl bg-lumina-primary/10 text-lumina-primary flex items-center justify-center font-black text-2xl">
                {project.name.charAt(0).toUpperCase()}
              </div>
              {user?.role === 'ADMIN' && (
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                  <button onClick={() => { setSelectedProject(project); setModalOpen(true); }} className="p-2 hover:bg-[var(--foreground)]/5 rounded-lg opacity-40 hover:opacity-100"><Edit2 className="w-4 h-4" /></button>
                  <button onClick={() => handleDelete(project._id)} className="p-2 hover:bg-red-500/10 text-red-500 rounded-lg opacity-40 hover:opacity-100"><Trash2 className="w-4 h-4" /></button>
                </div>
              )}
            </div>

            <h3 className="text-xl font-bold text-[var(--foreground)] mb-2">{project.name}</h3>
            <p className="text-sm text-[var(--foreground)] opacity-40 mb-6 line-clamp-2 italic font-medium">{project.description || 'No description provided.'}</p>

            <div className="mt-auto pt-6 border-t border-[var(--obsidian-border)] flex items-center justify-between">
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest opacity-30">
                <Users className="w-3.5 h-3.5" />
                <span>{project.members?.length || 0} Members</span>
              </div>
              <div className="flex -space-x-2">
                {project.members?.slice(0, 3).map((m: any, i: number) => (
                  <div key={i} className="w-6 h-6 rounded-full bg-lumina-primary flex items-center justify-center text-[8px] font-black text-white ring-2 ring-[var(--background)]">
                    {m.user?.name?.charAt(0) || '?'}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      <CreateEditProjectModal 
        isOpen={isModalOpen} 
        onClose={() => setModalOpen(false)} 
        project={selectedProject}
        users={users || []}
        onSuccess={() => mutateProjects()}
      />
    </div>
  );
}

function CreateEditProjectModal({ isOpen, onClose, project, users, onSuccess }: { isOpen: boolean, onClose: () => void, project: any, users: any[], onSuccess: () => void }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);

  useMemo(() => {
    if (isOpen) {
      setFormData({
        name: project?.name || '',
        description: project?.description || '',
      });
      setSelectedMembers(project?.members?.map((m: any) => m.userId) || []);
    }
  }, [isOpen, project]);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = { ...formData, members: selectedMembers };
      if (project) await api.put(`/projects/${project._id}`, payload);
      else await api.post('/projects', payload);
      onSuccess();
      onClose();
    } catch {
      toast.error('Failed to save project');
    } finally {
      setLoading(false);
    }
  };

  const toggleMember = (userId: string) => {
    setSelectedMembers(prev => prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={project ? 'Edit Project' : 'New Project'}>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-[10px] font-black uppercase tracking-widest opacity-40 mb-2">Project Name</label>
          <Input value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} placeholder="e.g. Website Redesign" required />
        </div>
        <div>
          <label className="block text-[10px] font-black uppercase tracking-widest opacity-40 mb-2">Description</label>
          <Input value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} placeholder="Project goals..." />
        </div>
        <div>
          <label className="block text-[10px] font-black uppercase tracking-widest opacity-40 mb-2">Assign Team</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto p-4 border border-[var(--obsidian-border)] rounded-xl bg-[var(--obsidian-surface)]">
            {users.map((u: any) => (
              <label key={u._id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-[var(--foreground)]/5 cursor-pointer">
                <input type="checkbox" checked={selectedMembers.includes(u._id)} onChange={() => toggleMember(u._id)} className="w-4 h-4 rounded border-[var(--obsidian-border)] text-lumina-primary focus:ring-lumina-primary/30" />
                <span className="text-xs font-bold text-[var(--foreground)] opacity-60">{u.name}</span>
              </label>
            ))}
          </div>
        </div>
        <div className="flex justify-end gap-3 pt-6 border-t border-[var(--obsidian-border)]">
          <button type="button" onClick={onClose} className="px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest opacity-40 hover:opacity-100 transition-all">Cancel</button>
          <button type="submit" disabled={loading} className="px-8 py-2.5 bg-lumina-primary hover:bg-lumina-primary/90 text-white text-xs font-black uppercase tracking-widest rounded-xl shadow-lg">{loading ? 'Saving...' : 'Save Project'}</button>
        </div>
      </form>
    </Modal>
  );
}
