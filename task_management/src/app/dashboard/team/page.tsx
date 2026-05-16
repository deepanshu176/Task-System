"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState, useEffect } from "react";
import useSWR from "swr";
import api from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import toast from "react-hot-toast";
import { 
  Search, 
  Edit2, 
  Trash2, 
  UserPlus, 
  Activity, 
  ShieldCheck
} from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const fetcher = (url: string) => api.get(url).then(res => res.data.data || res.data);

export default function TeamPage() {
  const user = useAuthStore(state => state.user);
  const [page] = useState(1);
  const [search, setSearch] = useState("");
  
  // Modals state
  const [isMemberModalOpen, setMemberModalOpen] = useState(false);
  const [isEditMemberModalOpen, setEditMemberModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);

  const { data: usersData, mutate: mutateUsers, isLoading: usersLoading } = useSWR(
    `/users?page=${page}&limit=20&search=${search}`, 
    fetcher
  );
  
  const { data: roles } = useSWR('/roles', fetcher);
  
  const hasManageUsers = user?.permissions?.includes('MANAGE_USERS') || user?.role === 'ADMIN';

  if (!hasManageUsers) return <div className="p-8 text-[var(--foreground)] opacity-40 font-black uppercase tracking-widest text-center py-20">Access Restricted.</div>;

  const handleStatusChange = async (userId: string, isActive: boolean) => {
    try {
      await api.patch(`/users/${userId}/status`, { isActive });
      mutateUsers();
      toast.success(isActive ? 'Member activated' : 'Member deactivated');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to change status');
    }
  };

  const handleRoleChange = async (userId: string, roleId: string) => {
    try {
      await api.patch(`/users/${userId}/role`, { roleId });
      mutateUsers();
      toast.success('Role updated successfully');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update role');
    }
  };

  const handleDeleteMember = async (userId: string) => {
    if (!confirm('Permanently remove this member?')) return;
    try {
      await api.delete(`/users/${userId}`);
      mutateUsers();
      toast.success('Member removed');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to remove member');
    }
  };

  return (
    <div className="h-full flex flex-col space-y-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black tracking-tighter text-[var(--foreground)]">Team Management</h2>
          <p className="text-[var(--foreground)] opacity-40 mt-1 font-medium italic">Manage your organization&apos;s team members and roles.</p>
        </div>
        <Button 
          onClick={() => { setSelectedUser(null); setMemberModalOpen(true); }} 
          className="bg-lumina-primary hover:bg-lumina-primary/90 text-white font-black h-12 px-6 rounded-2xl shadow-[0_0_20px_rgba(139,92,246,0.3)] transition-all flex items-center gap-2"
        >
          <UserPlus className="w-5 h-5" /> Add Member
        </Button>
      </div>

      <div className="space-y-6">
        <div className="flex items-center gap-4 glass-panel p-6 border-[var(--obsidian-border)]">
          <div className="relative flex-1 max-w-md group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--foreground)] opacity-20 w-4 h-4 group-hover:text-lumina-primary transition-colors" />
            <Input 
              placeholder="Search members..." 
              className="pl-10 bg-[var(--obsidian-surface)] border-[var(--obsidian-border)] h-12 rounded-xl text-sm font-bold text-[var(--foreground)] placeholder:text-[var(--foreground)]/20 focus:ring-lumina-primary/30 transition-all"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
             <Activity className="w-4 h-4 animate-pulse" />
             <span className="text-[10px] font-black uppercase tracking-widest">Live Updates</span>
          </div>
        </div>

        <div className="glass-panel rounded-[32px] border border-[var(--obsidian-border)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-[var(--obsidian-surface)] border-b border-[var(--obsidian-border)]">
                <tr>
                  <th className="px-8 py-5 font-black text-[10px] uppercase tracking-[0.2em] text-[var(--foreground)] opacity-40">Member</th>
                  <th className="px-8 py-5 font-black text-[10px] uppercase tracking-[0.2em] text-[var(--foreground)] opacity-40">Access Role</th>
                  <th className="px-8 py-5 font-black text-[10px] uppercase tracking-[0.2em] text-[var(--foreground)] opacity-40">Status</th>
                  <th className="px-8 py-5 font-black text-[10px] uppercase tracking-[0.2em] text-[var(--foreground)] opacity-40">Joined</th>
                  <th className="px-8 py-5 font-black text-[10px] uppercase tracking-[0.2em] text-[var(--foreground)] opacity-40 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--obsidian-border)]">
                {usersLoading ? (
                  <tr><td colSpan={5} className="px-8 py-20 text-center text-[var(--foreground)] opacity-10 font-black uppercase tracking-widest animate-pulse">Loading...</td></tr>
                ) : usersData?.length === 0 ? (
                  <tr><td colSpan={5} className="px-8 py-20 text-center text-[var(--foreground)] opacity-10 font-black uppercase tracking-widest italic">No members found.</td></tr>
                ) : (
                  usersData?.map((u: any) => (
                    <tr key={u._id} className="hover:bg-[var(--obsidian-surface)] transition-all group">
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-lumina-primary to-lumina-secondary flex items-center justify-center text-white font-black shadow-lg">
                            {u.name?.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-[var(--foreground)] text-base tracking-tight">{u.name}</p>
                            <p className="text-[var(--foreground)] opacity-20 text-xs font-medium">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="relative max-w-[140px]">
                           <select
                              value={u.roleId || ""}
                              onChange={(e) => handleRoleChange(u._id, e.target.value)}
                              disabled={u._id === user?.id}
                              className="bg-[var(--obsidian-surface)] border border-[var(--obsidian-border)] text-[var(--foreground)] text-xs font-bold rounded-xl block w-full p-2.5 transition-all outline-none appearance-none cursor-pointer hover:border-lumina-primary/30"
                            >
                              <option value="" disabled>Select Role</option>
                              {roles?.map((r: any) => (
                                <option key={r._id} value={r._id}>{r.name}</option>
                              ))}
                            </select>
                            <ShieldCheck className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-lumina-primary opacity-40 pointer-events-none" />
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-3">
                          <Switch 
                            checked={u.isActive} 
                            onChange={(val) => handleStatusChange(u._id, val)} 
                            className="data-[state=checked]:bg-emerald-500"
                          />
                          <span className={cn(
                            "text-[10px] font-black uppercase tracking-widest",
                            u.isActive ? 'text-emerald-500' : 'text-[var(--foreground)] opacity-20'
                          )}>
                            {u.isActive ? 'Active' : 'Disabled'}
                          </span>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-[var(--foreground)] opacity-30 font-medium text-xs">
                        {new Date(u.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                      </td>
                      <td className="px-8 py-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => { setSelectedUser(u); setEditMemberModalOpen(true); }}
                            className="p-2.5 text-[var(--foreground)] opacity-20 hover:text-[var(--foreground)] hover:bg-[var(--foreground)]/5 rounded-xl transition-all"
                            title="Edit"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDeleteMember(u._id)}
                            disabled={u._id === user?.id}
                            className="p-2.5 text-[var(--foreground)] opacity-20 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all disabled:opacity-0"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* MODALS */}
      <CreateEditUserModal 
        isOpen={isMemberModalOpen || isEditMemberModalOpen} 
        onClose={() => { setMemberModalOpen(false); setEditMemberModalOpen(false); }} 
        user={isEditMemberModalOpen ? selectedUser : null}
        roles={roles || []}
        onSuccess={() => mutateUsers()}
      />
    </div>
  );
}

// MEMBER MODAL
function CreateEditUserModal({ isOpen, onClose, user, roles, onSuccess }: { isOpen: boolean, onClose: () => void, user: any, roles: any[], onSuccess: () => void }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', password: '', roleId: '' });

  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: user?.name || '',
        email: user?.email || '',
        password: '',
        roleId: user?.roleId || (roles.length > 0 ? roles[0]._id : '')
      });
    }
  }, [isOpen, user, roles]);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (user) {
        await api.put(`/users/${user._id}`, formData);
        toast.success('Member updated');
      } else {
        await api.post('/users', formData);
        toast.success('Member created');
      }
      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to save member');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={user ? 'Edit Member' : 'Add Team Member'}>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-[10px] font-black uppercase tracking-widest text-[var(--foreground)] opacity-40 mb-2">Full Name</label>
          <Input value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} placeholder="e.g. John Doe" required />
        </div>
        <div>
          <label className="block text-[10px] font-black uppercase tracking-widest text-[var(--foreground)] opacity-40 mb-2">Email Address</label>
          <Input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} placeholder="email@example.com" required />
        </div>
        <div>
          <label className="block text-[10px] font-black uppercase tracking-widest text-[var(--foreground)] opacity-40 mb-2">Password {!user && <span className="text-red-400">*</span>}</label>
          <Input type="password" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} placeholder="••••••••" required={!user} />
        </div>
        <div>
          <label className="block text-[10px] font-black uppercase tracking-widest text-[var(--foreground)] opacity-40 mb-2">Access Role</label>
          <select 
            value={formData.roleId} 
            onChange={(e) => setFormData({...formData, roleId: e.target.value})}
            className="w-full bg-[var(--obsidian-surface)] border border-[var(--obsidian-border)] rounded-xl p-3 outline-none text-sm font-bold text-[var(--foreground)] focus:ring-2 focus:ring-lumina-primary/30 appearance-none transition-all cursor-pointer"
            required
          >
            <option value="" disabled>Select a role</option>
            {roles.map((r: any) => (
              <option key={r._id} value={r._id}>{r.name}</option>
            ))}
          </select>
        </div>
        <div className="flex justify-end gap-3 pt-6 border-t border-[var(--obsidian-border)]">
          <button type="button" onClick={onClose} className="px-6 py-3 rounded-xl text-sm font-bold text-[var(--foreground)] opacity-40 hover:opacity-100 transition-all">Cancel</button>
          <button type="submit" disabled={loading} className="px-8 py-3 bg-lumina-primary hover:bg-lumina-primary/90 text-white font-black text-sm rounded-xl shadow-xl disabled:opacity-50">{loading ? 'Saving...' : 'Save Member'}</button>
        </div>
      </form>
    </Modal>
  );
}
