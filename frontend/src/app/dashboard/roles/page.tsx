"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState } from "react";
import useSWR from "swr";
import api from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import toast from "react-hot-toast";
import { Plus, Edit2, Shield, Trash2 } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const fetcher = (url: string) => api.get(url).then(res => res.data.data || res.data);

export default function RolesPage() {
  const user = useAuthStore(state => state.user);
  
  const [isModalOpen, setModalOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<any>(null);

  const { data: roles, mutate: mutateRoles, isLoading } = useSWR('/roles', fetcher);
  const { data: permissions } = useSWR('/permissions', fetcher);

  const hasManageUsers = user?.permissions?.includes('MANAGE_USERS') || user?.role === 'ADMIN';

  if (!hasManageUsers) return <div className="p-8">You do not have permission to view this page.</div>;

  const handleDelete = async (roleId: string, roleName: string) => {
    if (roleName === 'ADMIN') {
      toast.error('Cannot delete ADMIN role');
      return;
    }
    if (!confirm(`Are you sure you want to delete the ${roleName} role?`)) return;
    try {
      await api.delete(`/roles/${roleId}`);
      mutateRoles();
      toast.success('Role deleted');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete role');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Role Management</h2>
          <p className="text-gray-500">Create custom roles and assign permissions.</p>
        </div>
        <Button onClick={() => { setSelectedRole(null); setModalOpen(true); }} className="flex items-center gap-2">
          <Plus className="w-4 h-4" /> Create Role
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          <div className="col-span-full p-8 text-center text-gray-500">Loading roles...</div>
        ) : roles?.map((role: any) => (
          <div key={role._id} className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 flex flex-col">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-purple-600" />
                  {role.name}
                </h3>
                <p className="text-sm text-gray-500 mt-1">{role.description || 'No description'}</p>
              </div>
            </div>
            
            <div className="flex-1">
              <div className="text-sm font-medium text-gray-700 mb-2">Permissions ({role.permissions?.length || 0}):</div>
              <div className="flex flex-wrap gap-1.5 mb-4">
                {role.permissions?.slice(0, 5).map((p: any) => (
                  <span key={p._id} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-[10px] uppercase font-semibold">
                    {p.permission.name.replace('_', ' ')}
                  </span>
                ))}
                {(role.permissions?.length || 0) > 5 && (
                  <span className="px-2 py-1 bg-gray-50 text-gray-500 rounded text-[10px] font-semibold">
                    +{(role.permissions?.length || 0) - 5} more
                  </span>
                )}
                {(role.permissions?.length === 0) && (
                  <span className="text-xs text-gray-400 italic">No permissions assigned</span>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100">
              <div className="text-xs text-gray-500 font-medium">
                {role._count?.users || 0} user(s) assigned
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => { setSelectedRole(role); setModalOpen(true); }}
                  className="p-1.5 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded transition"
                  title="Edit Role"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                {role.name !== 'ADMIN' && (
                  <button 
                    onClick={() => handleDelete(role._id, role.name)}
                    className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded transition"
                    title="Delete Role"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <CreateEditRoleModal 
        isOpen={isModalOpen} 
        onClose={() => setModalOpen(false)} 
        role={selectedRole}
        allPermissions={permissions || []}
        onSuccess={() => mutateRoles()}
      />
    </div>
  );
}

function CreateEditRoleModal({ isOpen, onClose, role, allPermissions, onSuccess }: { isOpen: boolean, onClose: () => void, role: any, allPermissions: any[], onSuccess: () => void }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: role?.name || '',
    description: role?.description || '',
  });
  const [selectedPerms, setSelectedPerms] = useState<Set<string>>(
    new Set(role?.permissions?.map((p: any) => p.permissionId) || [])
  );

  const togglePerm = (id: string) => {
    const next = new Set(selectedPerms);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedPerms(next);
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...formData,
        permissions: Array.from(selectedPerms)
      };

      if (role) {
        await api.put(`/roles/${role._id}`, payload);
        toast.success('Role updated');
      } else {
        await api.post('/roles', payload);
        toast.success('Role created');
      }
      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to save role');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={role ? 'Edit Role' : 'Create Custom Role'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Role Name</label>
          <Input 
            value={formData.name} 
            onChange={(e) => setFormData({...formData, name: e.target.value.toUpperCase()})} 
            placeholder="e.g., EDITOR"
            required 
            disabled={role?.name === 'ADMIN'}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <Input 
            value={formData.description} 
            onChange={(e) => setFormData({...formData, description: e.target.value})} 
            placeholder="Brief description of the role"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2 mt-4">Assign Permissions</label>
          <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto p-1 border rounded-md bg-gray-50">
            {allPermissions.map((p: any) => {
              const isSelected = selectedPerms.has(p._id);
              return (
                <label key={p._id} className="flex items-center space-x-2 p-2 rounded cursor-pointer hover:bg-white transition">
                  <input 
                    type="checkbox" 
                    checked={isSelected}
                    onChange={() => togglePerm(p._id)}
                    className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                  />
                  <span className="text-xs font-medium text-gray-800">{p.name.replace('_', ' ')}</span>
                </label>
              );
            })}
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="submit" disabled={loading}>{loading ? 'Saving...' : 'Save Role'}</Button>
        </div>
      </form>
    </Modal>
  );
}
