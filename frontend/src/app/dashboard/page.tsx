"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import useSWR from "swr";
import api from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { CheckCircle2, Clock, FolderKanban, TrendingUp, Users } from "lucide-react";

const fetcher = (url: string) => api.get(url).then(res => res.data.data || res.data);

export default function DashboardPage() {
  const user = useAuthStore(state => state.user);
  const { data: stats, isLoading } = useSWR('/dashboard', fetcher);
  const isAdmin = user?.role === 'ADMIN';

  const dashboardStats = [
    { name: 'Total Tasks', value: stats?.totalTasks || 0, icon: CheckCircle2, color: 'text-blue-600', bg: 'bg-blue-100' },
    { name: 'Pending Tasks', value: stats?.pendingTasks || 0, icon: Clock, color: 'text-orange-600', bg: 'bg-orange-100' },
    { name: 'Completed Tasks', value: stats?.completedTasks || 0, icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-100' },
    { name: 'Active Projects', value: stats?.activeProjects || 0, icon: FolderKanban, color: 'text-purple-600', bg: 'bg-purple-100' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-gray-900">Dashboard</h2>
        <p className="text-gray-500 mt-1">Here&apos;s what&apos;s happening with your projects today.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {dashboardStats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.name} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Icon className={`w-16 h-16 ${stat.color}`} />
              </div>
              <div className="flex items-center gap-4 mb-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.bg} ${stat.color}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">{stat.name}</p>
                  <p className="text-3xl font-bold text-gray-900">{isLoading ? '-' : stat.value}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className={`${isAdmin ? 'col-span-2' : 'col-span-full'} bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col min-h-[400px]`}>
          <h3 className="text-lg font-bold text-gray-900 mb-6">Recent Activity</h3>
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
              <TrendingUp className="w-8 h-8 text-gray-300" />
            </div>
            <p>Connect backend timeline events here.</p>
          </div>
        </div>

        {isAdmin && (
          <div className="col-span-1 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-900">Active Members</h3>
              <div className="w-11 h-11 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center">
                <Users className="w-6 h-6" />
              </div>
            </div>
            <p className="text-5xl font-bold text-gray-900">{isLoading ? '-' : stats?.activeMembers || 0}</p>
            <p className="text-sm text-gray-500 mt-3">Currently active team members.</p>
          </div>
        )}
      </div>
    </div>
  );
}
