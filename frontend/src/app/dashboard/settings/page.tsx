"use client";

import { useAuthStore } from "@/store/authStore";
import { User, Shield, Bell, Zap, Mail, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * PREMIUM SETTINGS PAGE
 * 
 * Allows users to manage their profile, security, and notification preferences.
 * Implemented with a high-fidelity light theme consistent with the Lumina brand.
 */
export default function SettingsPage() {
  const { user } = useAuthStore();

  return (
    <div className="max-w-4xl mx-auto space-y-12 pb-20">
      <div className="space-y-1">
        <h2 className="text-4xl font-black tracking-tight text-slate-900">Settings</h2>
        <p className="text-slate-500 font-medium italic">Manage your profile and workspace preferences.</p>
      </div>

      <div className="grid gap-8">
        {/* Profile Section */}
        <section className="bg-white border border-slate-100 rounded-[2.5rem] p-10 shadow-sm">
          <div className="flex items-center gap-4 mb-10">
            <div className="w-12 h-12 bg-blue-600/10 rounded-2xl flex items-center justify-center">
               <User className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-xl font-black text-slate-900">Account Profile</h3>
          </div>

          <div className="space-y-8">
            <div className="flex items-center gap-8">
               <div className="w-24 h-24 rounded-3xl bg-blue-600 text-white flex items-center justify-center text-4xl font-black shadow-lg shadow-blue-600/20">
                  {user?.name?.charAt(0).toUpperCase()}
               </div>
               <div className="space-y-4 flex-1">
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block ml-1">Full Name</label>
                    <div className="h-14 bg-slate-50 border border-slate-100 rounded-2xl flex items-center px-6 font-bold text-slate-700">
                       {user?.name}
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block ml-1">Email Address</label>
                    <div className="h-14 bg-slate-50 border border-slate-100 rounded-2xl flex items-center px-6 font-bold text-slate-700">
                       {user?.email}
                    </div>
                  </div>
               </div>
            </div>
          </div>
        </section>

        {/* Workspace Section */}
        <section className="bg-white border border-slate-100 rounded-[2.5rem] p-10 shadow-sm">
           <div className="flex items-center gap-4 mb-10">
            <div className="w-12 h-12 bg-violet-600/10 rounded-2xl flex items-center justify-center">
               <Shield className="w-6 h-6 text-violet-600" />
            </div>
            <h3 className="text-xl font-black text-slate-900">Workspace Security</h3>
          </div>

          <div className="space-y-6">
             <div className="p-6 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-between">
                <div>
                  <p className="font-bold text-slate-900">Current Role</p>
                  <p className="text-xs text-slate-400 font-medium italic">Your permissions are managed by the organization.</p>
                </div>
                <span className="px-4 py-1.5 bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg shadow-blue-600/20">
                  {user?.role}
                </span>
             </div>

             <div className="p-6 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-between">
                <div>
                  <p className="font-bold text-slate-900">Two-Factor Authentication</p>
                  <p className="text-xs text-slate-400 font-medium italic">Add an extra layer of security to your account.</p>
                </div>
                <Button variant="outline" className="h-10 px-6 rounded-xl border-slate-200 text-[10px] font-black uppercase tracking-widest hover:bg-white">Enable 2FA</Button>
             </div>
          </div>
        </section>

        {/* Danger Zone */}
        <section className="bg-rose-50 border border-rose-100 rounded-[2.5rem] p-10">
           <div className="flex items-center gap-4 mb-6">
              <Trash2 className="w-6 h-6 text-rose-500" />
              <h3 className="text-xl font-black text-rose-900">Danger Zone</h3>
           </div>
           <p className="text-sm text-rose-600 font-medium italic mb-8">Permanently delete your account and all associated workspace data. This action is irreversible.</p>
           <Button className="h-14 px-10 bg-rose-600 hover:bg-rose-700 text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-xl shadow-rose-600/20">Delete Account</Button>
        </section>
      </div>
    </div>
  );
}
