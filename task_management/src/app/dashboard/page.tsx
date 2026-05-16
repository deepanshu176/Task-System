"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import Link from "next/link";
import useSWR from "swr";
import api from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { CheckCircle2, Clock, FolderKanban, TrendingUp, Users, Activity } from "lucide-react";
import { cn } from "@/lib/utils";

const fetcher = (url: string) => api.get(url).then(res => res.data.data || res.data);

export default function DashboardPage() {
  const user = useAuthStore(state => state.user);
  const isAdmin = user?.role === 'ADMIN';
  const emptyStats = {
    totalTasks: 0,
    pendingTasks: 0,
    completedTasks: 0,
    activeProjects: 0,
  };
  
  // Parallel fetch using SWR
  const { data: stats } = useSWR('/dashboard', fetcher, {
    revalidateOnFocus: true,
    refreshInterval: 3000,
    dedupingInterval: 2000,
    fallbackData: emptyStats,
  });
  
  const { data: users, isLoading: usersLoading } = useSWR(isAdmin ? '/users?limit=100' : null, fetcher, {
    revalidateOnFocus: true,
    refreshInterval: 5000,
    dedupingInterval: 2000,
    fallbackData: [],
  });
  
  const allUsers = Array.isArray(users) ? users : users?.data || [];
  const totalMembers = allUsers.filter((u: any) => u.roleName !== 'ADMIN').length;

  const dashboardStats = [
    { name: 'Total Tasks', value: stats?.totalTasks || 0, icon: CheckCircle2, color: 'text-blue-500' },
    { name: 'Pending Tasks', value: stats?.pendingTasks || 0, icon: Clock, color: 'text-amber-500' },
    { name: 'Completed Tasks', value: stats?.completedTasks || 0, icon: TrendingUp, color: 'text-emerald-500' },
    { name: 'Active Projects', value: stats?.activeProjects || 0, icon: FolderKanban, color: 'text-violet-500' },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white">Dashboard</h2>
          <p className="text-slate-500 mt-1 font-medium italic dark:text-slate-400">Overview of your productivity and team.</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {dashboardStats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.name} className="bg-white border border-slate-100 p-6 rounded-2xl shadow-sm hover:shadow-md transition-all group dark:bg-slate-900 dark:border-slate-800 dark:shadow-none">
              <div className="flex items-center justify-between mb-4">
                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center bg-slate-50 border border-slate-100 shadow-sm group-hover:scale-110 transition-transform dark:bg-slate-950 dark:border-slate-800 dark:shadow-none", stat.color)}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1 dark:text-slate-500">{stat.name}</p>
                <p className="text-4xl font-black text-slate-900 tracking-tight dark:text-white">
                  {stat.value}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        <div className="lg:col-span-2 bg-white border border-slate-100 p-8 rounded-[2.5rem] shadow-sm flex flex-col min-h-[400px] dark:bg-slate-900 dark:border-slate-800 dark:shadow-none">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-black text-slate-900 flex items-center gap-3 dark:text-white">
              <Activity className="w-6 h-6 text-blue-600" />
              Recent Activity
            </h3>
          </div>
          <div className="flex-1 flex flex-col items-center justify-center text-center text-slate-900 opacity-10 dark:text-slate-400 dark:opacity-30">
            <Clock className="w-16 h-16 mb-6" />
            <p className="text-xs font-black uppercase tracking-widest">No activity recorded yet</p>
          </div>
        </div>

        {isAdmin && (
          <div className="lg:col-span-1 bg-white border border-slate-100 p-8 rounded-[2.5rem] shadow-sm flex flex-col justify-between dark:bg-slate-900 dark:border-slate-800 dark:shadow-none">
            <div>
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-black text-slate-900 dark:text-white">Team Performance</h3>
                <Users className="w-6 h-6 text-blue-600 opacity-20" />
              </div>
              <p className="text-8xl font-black text-slate-900 tracking-tighter dark:text-white">
                {usersLoading ? (
                  <span className="inline-block w-24 h-24 bg-slate-100 animate-pulse rounded-2xl dark:bg-slate-800" />
                ) : totalMembers}
              </p>
              <p className="text-xs text-slate-400 mt-6 font-medium italic dark:text-slate-500">
                Active collaborators across all projects.
              </p>
            </div>
            <div className="pt-8 mt-8 border-t border-slate-100 dark:border-slate-800">
              <Link href="/dashboard/team" className="w-full block text-center py-4 bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-black rounded-2xl transition-all uppercase tracking-widest shadow-lg shadow-blue-600/20">
                Manage Organization
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
