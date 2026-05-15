"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState } from "react";
import useSWR from "swr";
import api from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import toast from "react-hot-toast";
import { Search, Plus, Edit2, Shield, Trash2 } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const fetcher = (url: string) => api.get(url).then(res => res.data.data || res.data);

export default function TeamPage() {
  const user = useAuthStore(state => state.user);
  
  const [page] = useState(1);
  const [search, setSearch] = useState("");
  
  // Modals state
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [isPermsModalOpen, setPermsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);

  const { data: usersData, mutate: mutateUsers, isLoading } = useSWR(
    `/users?page=${page}&limit=10&search=${search}`, 
    fetcher
  );
  
  const { data: roles } = useSWR('/roles', fetcher);
  const { data: permissions } = useSWR('/permissions', fetcher);

  const hasManageUsers = user?.permissions?.includes('MANAGE_USERS') || user?.role === 'ADMIN';

  if (!hasManageUsers) return <div className="p-8">You do not have permission to view this page.</div>;

  const handleStatusChange = async (userId: string, isActive: boolean) => {
    try {
      await api.patch(`/users/${userId}/status`, { isActive });
      mutateUsers();
      toast.success(isActive ? 'User activated' : 'User deactivated');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to change status');
    }
  };

  const handleRoleChange = async (userId: string, roleId: string) => {
    try {
      await api.patch(`/users/${userId}/role`, { roleId });
      mutateUsers();
      toast.success('Role updated');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update role');
    }
  };

  const handleDelete = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    try {
      await api.delete(`/users/${userId}`);
      mutateUsers();
      toast.success('User deleted');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete user');
    }
  };

  const handleSavePermissions = async (userId: string, selectedPerms: string[]) => {
    try {
      await api.patch(`/users/${userId}/permissions`, { permissions: selectedPerms });
      mutateUsers();
      toast.success('Permissions updated');
      setPermsModalOpen(false);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update permissions');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">User Management</h2>
          <p className="text-gray-500">Manage your team members and their roles.</p>
        </div>
        <Button onClick={() => { setSelectedUser(null); setCreateModalOpen(true); }} className="flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add User
        </Button>
      </div>

      <div className="flex items-center gap-4 bg-white p-4 rounded-lg shadow-sm border border-gray-100">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input 
            placeholder="Search users..." 
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-4 font-medium text-gray-500">User</th>
                <th className="px-6 py-4 font-medium text-gray-500">Role</th>
                <th className="px-6 py-4 font-medium text-gray-500">Status</th>
                <th className="px-6 py-4 font-medium text-gray-500">Joined</th>
                <th className="px-6 py-4 font-medium text-gray-500 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500">Loading...</td></tr>
              ) : usersData?.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500">No users found.</td></tr>
              ) : (
                usersData?.map((u: any) => (
                  <tr key={u._id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-semibold shadow-inner">
                          {u.name?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{u.name}</p>
                          <p className="text-gray-500 text-xs">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={u.roleId || ""}
                        onChange={(e) => handleRoleChange(u._id, e.target.value)}
                        disabled={u._id === user?.id}
                        className="bg-gray-50 border border-gray-200 text-gray-900 text-xs rounded focus:ring-blue-500 focus:border-blue-500 block w-full p-2"
                      >
                        <option value="" disabled>Select Role</option>
                        {roles?.map((r: any) => (
                          <option key={r._id} value={r._id}>{r.name}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Switch 
                          checked={u.isActive} 
                          onChange={(val) => handleStatusChange(u._id, val)} 
                        />
                        <span className={`text-xs font-medium ${u.isActive ? 'text-green-600' : 'text-gray-500'}`}>
                          {u.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => { setSelectedUser(u); setPermsModalOpen(true); }}
                          className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition"
                          title="Manage Permissions"
                        >
                          <Shield className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => { setSelectedUser(u); setEditModalOpen(true); }}
                          className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition"
                          title="Edit User"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(u._id)}
                          disabled={u._id === user?.id}
                          className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-md transition disabled:opacity-50"
                          title="Delete User"
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

      <CreateEditUserModal 
        isOpen={isCreateModalOpen || isEditModalOpen} 
        onClose={() => { setCreateModalOpen(false); setEditModalOpen(false); }} 
        user={isEditModalOpen ? selectedUser : null}
        roles={roles || []}
        onSuccess={() => mutateUsers()}
      />

      {selectedUser && (
        <PermissionsModal 
          isOpen={isPermsModalOpen}
          onClose={() => setPermsModalOpen(false)}
          user={selectedUser}
          allPermissions={permissions || []}
          onSave={(perms) => handleSavePermissions(selectedUser._id, perms)}
        />
      )}
    </div>
  );
}

function CreateEditUserModal({ isOpen, onClose, user, roles, onSuccess }: { isOpen: boolean, onClose: () => void, user: any, roles: any[], onSuccess: () => void }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    password: '',
    roleId: user?.roleId || roles[0]?._id || ''
  });

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (user) {
        await api.put(`/users/${user._id}`, formData);
        toast.success('User updated');
      } else {
        await api.post('/users', formData);
        toast.success('User created');
      }
      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to save user');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={user ? 'Edit User' : 'Create User'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Name</label>
          <Input 
            value={formData.name} 
            onChange={(e) => setFormData({...formData, name: e.target.value})} 
            required 
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <Input 
            type="email" 
            value={formData.email} 
            onChange={(e) => setFormData({...formData, email: e.target.value})} 
            required 
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">
            Password {user && <span className="text-gray-400 font-normal">(Leave blank to keep unchanged)</span>}
          </label>
          <Input 
            type="password" 
            value={formData.password} 
            onChange={(e) => setFormData({...formData, password: e.target.value})} 
            required={!user} 
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Role</label>
          <select 
            value={formData.roleId} 
            onChange={(e) => setFormData({...formData, roleId: e.target.value})}
            className="w-full border border-gray-300 rounded-md p-2 outline-none focus:ring-2 focus:ring-blue-600"
            required
          >
            <option value="" disabled>Select a role</option>
            {roles.map((r: any) => (
              <option key={r._id} value={r._id}>{r.name}</option>
            ))}
          </select>
        </div>
        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="submit" disabled={loading}>{loading ? 'Saving...' : 'Save'}</Button>
        </div>
      </form>
    </Modal>
  );
}

function PermissionsModal({ isOpen, onClose, user, allPermissions, onSave }: { isOpen: boolean, onClose: () => void, user: any, allPermissions: any[], onSave: (perms: string[]) => void }) {
  const [selected, setSelected] = useState<Set<string>>(new Set(user.userPermissions.map((up: any) => up.permissionId)));

  const togglePerm = (id: string) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelected(next);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Custom Permissions for ${user.name}`}>
      <p className="text-sm text-gray-500 mb-4">
        Users inherit permissions from their assigned role. Select permissions below to explicitly assign them overrides.
      </p>
      <div className="grid grid-cols-2 gap-3 max-h-60 overflow-y-auto p-1">
        {allPermissions.map((p: any) => {
          const isInherited = user.role?.permissions?.some((rp: any) => rp.permissionId === p._id);
          const isSelected = selected.has(p._id);
          return (
            <label key={p._id} className={`flex items-start space-x-3 p-3 rounded-lg border cursor-pointer transition ${isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:bg-gray-50'}`}>
              <div className="flex items-center h-5">
                <input 
                  type="checkbox" 
                  checked={isSelected}
                  onChange={() => togglePerm(p._id)}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 border-gray-300"
                />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium text-gray-900">{p.name}</span>
                {isInherited && <span className="text-xs text-purple-600 font-medium">Inherited from {user.role?.name}</span>}
              </div>
            </label>
          );
        })}
      </div>
      <div className="flex justify-end gap-2 mt-6">
        <Button variant="outline" onClick={onClose}>Cancel</Button>
        <Button onClick={() => onSave(Array.from(selected))}>Save Permissions</Button>
      </div>
    </Modal>
  );
}
