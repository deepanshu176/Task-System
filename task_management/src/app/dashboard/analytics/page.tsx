"use client";

import { useEffect, useMemo, useState } from "react";
import useSWR from "swr";
import {
  Activity,
  BarChart3,
  CheckCircle2,
  Download,
  FolderKanban,
  PieChart,
  TrendingUp,
  Users,
  Zap
} from "lucide-react";
import api from "@/lib/api";
import { cn } from "@/lib/utils";

type Project = {
  _id: string;
  name: string;
  status?: string;
};

type TaskStatus = "TODO" | "IN_PROGRESS" | "COMPLETED";

type Task = {
  _id: string;
  title: string;
  status: TaskStatus;
  priority?: "LOW" | "MEDIUM" | "HIGH";
  projectId?: string;
  assigneeIds?: string[];
  dueDate?: string;
  createdAt?: string;
  updatedAt?: string;
};

type DateRange = "30" | "90" | "all";

const fetcher = (url: string) => api.get(url).then((res) => res.data.data || res.data);

const monthLabels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function withinRange(dateValue: string | undefined, range: DateRange) {
  if (range === "all" || !dateValue) return true;
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return true;
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - Number(range));
  return date >= cutoff;
}

function percent(value: number, total: number) {
  if (total === 0) return 0;
  return Math.round((value / total) * 100);
}

export default function AnalyticsPage() {
  const [selectedProjectId, setSelectedProjectId] = useState("all");
  const [dateRange, setDateRange] = useState<DateRange>("30");

  const { data: projectsData } = useSWR<Project[]>("/projects", fetcher, {
    fallbackData: [],
    revalidateOnFocus: true,
    refreshInterval: 5000,
    dedupingInterval: 2000,
  });

  const taskUrl = selectedProjectId === "all" ? "/tasks" : `/tasks?projectId=${selectedProjectId}`;
  const { data: tasksData } = useSWR<Task[]>(taskUrl, fetcher, {
    fallbackData: [],
    revalidateOnFocus: true,
    refreshInterval: 5000,
    dedupingInterval: 2000,
  });

  const projects = useMemo(() => Array.isArray(projectsData) ? projectsData : [], [projectsData]);
  const tasks = useMemo(() => Array.isArray(tasksData) ? tasksData : [], [tasksData]);

  useEffect(() => {
    if (selectedProjectId === "all" && projects.length > 0) {
      setSelectedProjectId(projects[0]._id);
    }
  }, [projects, selectedProjectId]);
  const filteredTasks = useMemo(
    () => tasks.filter((task) => withinRange(task.createdAt || task.updatedAt, dateRange)),
    [tasks, dateRange]
  );

  const selectedProject = projects.find((project) => project._id === selectedProjectId);
  const totalTasks = filteredTasks.length;
  const completedTasks = filteredTasks.filter((task) => task.status === "COMPLETED").length;
  const inProgressTasks = filteredTasks.filter((task) => task.status === "IN_PROGRESS").length;
  const todoTasks = filteredTasks.filter((task) => task.status === "TODO").length;
  const highPriorityTasks = filteredTasks.filter((task) => task.priority === "HIGH").length;
  const assignedUsers = new Set(filteredTasks.flatMap((task) => task.assigneeIds || [])).size;
  const completionRate = percent(completedTasks, totalTasks);
  const velocityScore = Math.min(100, completionRate + inProgressTasks * 8);
  const utilizationRate = percent(filteredTasks.filter((task) => (task.assigneeIds || []).length > 0).length, totalTasks);

  const monthlyCounts = useMemo(() => {
    const counts = Array(12).fill(0) as number[];
    filteredTasks.forEach((task) => {
      const date = new Date(task.createdAt || task.updatedAt || Date.now());
      if (!Number.isNaN(date.getTime())) counts[date.getMonth()] += 1;
    });
    const max = Math.max(...counts, 1);
    return counts.map((count, index) => ({
      label: monthLabels[index],
      count,
      height: Math.max(8, Math.round((count / max) * 100))
    }));
  }, [filteredTasks]);

  const stats = [
    { label: "Task Completion", value: `${completionRate}%`, detail: `${completedTasks}/${totalTasks} done`, icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-500/10" },
    { label: "Project Velocity", value: `${velocityScore}`, detail: `${inProgressTasks} in progress`, icon: TrendingUp, color: "text-blue-500", bg: "bg-blue-500/10" },
    { label: "Resource Utilization", value: `${utilizationRate}%`, detail: `${assignedUsers} assigned users`, icon: Users, color: "text-violet-500", bg: "bg-violet-500/10" },
    { label: "Open Work", value: `${todoTasks + inProgressTasks}`, detail: `${highPriorityTasks} high priority`, icon: Zap, color: "text-amber-500", bg: "bg-amber-500/10" },
  ];

  const criticalMetrics = [
    { name: "To Do", value: percent(todoTasks, totalTasks), count: todoTasks },
    { name: "In Progress", value: percent(inProgressTasks, totalTasks), count: inProgressTasks },
    { name: "Completed", value: completionRate, count: completedTasks },
    { name: "High Priority", value: percent(highPriorityTasks, totalTasks), count: highPriorityTasks },
  ];

  const exportReport = () => {
    const scope = selectedProject?.name || "All Projects";
    const report = {
      scope,
      dateRange,
      generatedAt: new Date().toISOString(),
      summary: {
        totalTasks,
        completedTasks,
        inProgressTasks,
        todoTasks,
        highPriorityTasks,
        completionRate,
        velocityScore,
        utilizationRate
      },
      tasks: filteredTasks
    };
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${scope.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-analytics.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="h-full flex flex-col space-y-8 pb-10">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-blue-600" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-600">Project Analytics</span>
          </div>
          <h2 className="text-4xl font-black tracking-tighter text-slate-900">Analytics</h2>
          <p className="mt-1 text-sm font-medium text-slate-500">
            {selectedProject ? `${selectedProject.name} performance and task insights.` : "Performance and task insights across all projects."}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <select
            value={selectedProjectId}
            onChange={(event) => setSelectedProjectId(event.target.value)}
            className="h-11 min-w-[220px] rounded-xl border border-slate-100 bg-white px-4 text-sm font-bold text-slate-700 outline-none transition-all focus:border-blue-600/30 focus:ring-2 focus:ring-blue-600/10"
          >
            <option value="all">All Projects</option>
            {projects.map((project) => (
              <option key={project._id} value={project._id}>{project.name}</option>
            ))}
          </select>

          <select
            value={dateRange}
            onChange={(event) => setDateRange(event.target.value as DateRange)}
            className="h-11 rounded-xl border border-slate-100 bg-white px-4 text-sm font-bold text-slate-700 outline-none transition-all focus:border-blue-600/30 focus:ring-2 focus:ring-blue-600/10"
          >
            <option value="30">Last 30 Days</option>
            <option value="90">Last 90 Days</option>
            <option value="all">All Time</option>
          </select>

          <div className="flex h-11 items-center gap-3 rounded-xl border border-slate-100 bg-white px-4">
            <Activity className="h-4 w-4 animate-pulse text-emerald-500" />
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Live Local Data</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="relative overflow-hidden rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
              <div className="relative z-10 mb-5 flex items-start justify-between">
                <div className={cn("rounded-xl p-3", stat.bg)}>
                  <Icon className={cn("h-6 w-6", stat.color)} />
                </div>
                <span className="rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-black text-emerald-600">
                  LIVE
                </span>
              </div>
              <p className="mb-1 text-[10px] font-black uppercase tracking-widest text-slate-400">{stat.label}</p>
              <h3 className="text-3xl font-black tracking-tighter text-slate-900">{stat.value}</h3>
              <p className="mt-1 text-xs font-semibold text-slate-400">{stat.detail}</p>
              <Icon className="absolute -bottom-5 -right-5 h-24 w-24 text-slate-900 opacity-[0.03]" />
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="flex h-[400px] flex-col rounded-[32px] border border-slate-100 bg-white p-8 shadow-sm lg:col-span-2">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h3 className="text-xl font-black tracking-tight text-slate-900">Task Activity</h3>
              <p className="text-xs font-medium text-slate-400">Monthly task volume for the selected project scope.</p>
            </div>
            <FolderKanban className="h-6 w-6 text-blue-600" />
          </div>

          <div className="flex flex-1 items-end gap-4 px-2 pb-4">
            {monthlyCounts.map((month) => (
              <div key={month.label} className="group relative flex flex-1 flex-col items-center justify-end">
                <div className="mb-2 text-[10px] font-black text-slate-400 opacity-0 transition-opacity group-hover:opacity-100">
                  {month.count}
                </div>
                <div
                  className="w-full rounded-t-lg bg-blue-600/20 transition-all hover:bg-blue-600"
                  style={{ height: `${month.height}%` }}
                />
              </div>
            ))}
          </div>
          <div className="flex justify-between px-2">
            {monthlyCounts.map((month) => (
              <span key={month.label} className="text-[9px] font-black uppercase tracking-widest text-slate-300">{month.label}</span>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-[28px] border border-slate-100 bg-white p-6 shadow-sm">
            <h3 className="mb-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Critical Metrics</h3>
            <div className="space-y-4">
              {criticalMetrics.map((metric) => (
                <div key={metric.name} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-xs font-black text-slate-700">{metric.name}</span>
                    <span className="text-[10px] font-black text-slate-400">{metric.count} tasks</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-white">
                      <div className="h-full rounded-full bg-blue-600 transition-all" style={{ width: `${metric.value}%` }} />
                    </div>
                    <span className="w-9 text-right text-xs font-black text-slate-900">{metric.value}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={exportReport}
            className="group relative flex w-full items-center justify-between overflow-hidden rounded-[28px] border border-blue-100 bg-blue-50 p-8 text-left transition-all hover:border-blue-200 hover:bg-blue-100"
          >
            <div className="relative z-10">
              <h3 className="mb-1 text-sm font-black text-blue-600">Generate Export</h3>
              <p className="text-[11px] font-semibold text-slate-500">Download a JSON report for this project scope.</p>
            </div>
            <Download className="relative z-10 h-5 w-5 text-blue-600 transition-transform group-hover:-translate-y-1" />
            <PieChart className="absolute -bottom-4 -right-4 h-24 w-24 text-blue-600/10" />
          </button>
        </div>
      </div>
    </div>
  );
}
