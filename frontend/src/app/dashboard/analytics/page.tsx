"use client";

import { BarChart3, TrendingUp, Users, CheckCircle2, Clock, Zap, Activity, PieChart, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { cn } from "@/lib/utils";

const STATS = [
  { label: "Operational Efficiency", value: "94.2%", trend: "+2.4%", icon: Zap, color: "text-amber-400", bg: "bg-amber-400/10" },
  { label: "Project Velocity", value: "88.7", trend: "+5.1%", icon: TrendingUp, color: "text-lumina-primary", bg: "bg-lumina-primary/10" },
  { label: "Resource Utilization", value: "76.4%", trend: "-1.2%", icon: Users, color: "text-blue-400", bg: "bg-blue-400/10" },
  { label: "Task Completion", value: "91.0%", trend: "+0.8%", icon: CheckCircle2, color: "text-emerald-400", bg: "bg-emerald-400/10" },
];

const RECENT_METRICS = [
  { name: "Frontend Optimization", value: 85, status: "Normal", time: "2m ago" },
  { name: "API Response Latency", value: 12, status: "Peak", time: "5m ago" },
  { name: "Database Throughput", value: 92, status: "High", time: "12m ago" },
  { name: "Concurrent Sessions", value: 48, status: "Normal", time: "15m ago" },
];

export default function AnalyticsPage() {
  return (
    <div className="h-full flex flex-col space-y-10 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
             <BarChart3 className="w-4 h-4 text-lumina-primary" />
             <span className="text-[10px] font-black uppercase tracking-[0.3em] text-lumina-primary">Performance Intelligence</span>
          </div>
          <h2 className="text-4xl font-black tracking-tighter text-[var(--foreground)]">System Analytics</h2>
          <p className="text-[var(--foreground)] opacity-40 mt-1 font-medium italic">High-precision metrics and industrial operational insights.</p>
        </div>
        
        <div className="flex items-center gap-4">
            <div className="px-4 py-2 rounded-xl bg-[var(--obsidian-surface)] border border-[var(--obsidian-border)] flex items-center gap-3">
               <Activity className="w-4 h-4 text-emerald-500 animate-pulse" />
               <span className="text-[10px] font-black text-[var(--foreground)] opacity-40 uppercase tracking-widest">Real-time Data Stream</span>
            </div>
        </div>
      </div>

      {/* Grid Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {STATS.map((stat, idx) => (
          <div key={idx} className="glass-card p-6 border-[var(--obsidian-border)] relative overflow-hidden group">
            <div className="flex justify-between items-start mb-4 relative z-10">
              <div className={cn("p-3 rounded-xl", stat.bg)}>
                <stat.icon className={cn("w-6 h-6", stat.color)} />
              </div>
              <div className={cn(
                "flex items-center gap-1 text-[10px] font-black px-2 py-1 rounded-full",
                stat.trend.startsWith('+') ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"
              )}>
                {stat.trend.startsWith('+') ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                {stat.trend}
              </div>
            </div>
            <div className="relative z-10">
              <p className="text-[10px] font-black uppercase tracking-widest text-[var(--foreground)] opacity-30 mb-1">{stat.label}</p>
              <h3 className="text-3xl font-black text-[var(--foreground)] tracking-tighter">{stat.value}</h3>
            </div>
            {/* Industrial Accent */}
            <div className="absolute right-0 bottom-0 opacity-5 group-hover:opacity-10 transition-opacity">
               <stat.icon className="w-24 h-24 translate-x-4 translate-y-4" />
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Chart Placeholder */}
        <div className="lg:col-span-2 glass-panel p-8 rounded-[32px] border-[var(--obsidian-border)] flex flex-col h-[400px]">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h3 className="text-xl font-bold text-[var(--foreground)] tracking-tight">Resource Allocation</h3>
              <p className="text-xs text-[var(--foreground)] opacity-30 font-medium italic">Monthly distribution across project sectors.</p>
            </div>
            <select className="bg-[var(--obsidian-surface)] border border-[var(--obsidian-border)] text-[10px] font-black uppercase tracking-widest text-[var(--foreground)] px-4 py-2 rounded-xl outline-none">
              <option>Last 30 Days</option>
              <option>Last 90 Days</option>
            </select>
          </div>
          
          <div className="flex-1 flex items-end gap-4 px-4 pb-4">
             {[65, 45, 85, 30, 95, 60, 40, 75, 55, 80, 50, 70].map((h, i) => (
               <div key={i} className="flex-1 group relative">
                  <div 
                    className="w-full bg-lumina-primary/20 hover:bg-lumina-primary transition-all rounded-t-lg cursor-pointer" 
                    style={{ height: `${h}%` }}
                  >
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-[var(--obsidian-surface)] border border-[var(--obsidian-border)] text-[9px] font-black px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      {h}% Load
                    </div>
                  </div>
                  <div className="mt-4 h-1 w-full bg-[var(--obsidian-border)] rounded-full"></div>
               </div>
             ))}
          </div>
          <div className="flex justify-between mt-4 px-2">
             {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map(m => (
               <span key={m} className="text-[9px] font-black uppercase tracking-widest text-[var(--foreground)] opacity-20">{m}</span>
             ))}
          </div>
        </div>

        {/* Side Metrics */}
        <div className="lg:col-span-1 space-y-6">
          <div className="glass-panel p-6 border-[var(--obsidian-border)]">
             <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--foreground)] opacity-20 mb-6">Critical Metrics</h3>
             <div className="space-y-4">
                {RECENT_METRICS.map((metric, i) => (
                  <div key={i} className="p-4 rounded-2xl bg-[var(--obsidian-surface)] border border-[var(--obsidian-border)] group hover:border-lumina-primary/30 transition-all">
                     <div className="flex justify-between items-center mb-3">
                        <span className="text-xs font-bold text-[var(--foreground)] opacity-60 group-hover:text-lumina-primary transition-colors">{metric.name}</span>
                        <span className="text-[10px] font-black uppercase text-[var(--foreground)] opacity-20">{metric.time}</span>
                     </div>
                     <div className="flex items-center gap-4">
                        <div className="flex-1 h-1.5 bg-[var(--background)] rounded-full overflow-hidden">
                           <div className="h-full bg-lumina-primary transition-all duration-1000" style={{ width: `${metric.value}%` }} />
                        </div>
                        <span className="text-xs font-black text-[var(--foreground)] w-8 text-right">{metric.value}%</span>
                     </div>
                  </div>
                ))}
             </div>
          </div>

          <div className="glass-card p-8 border-lumina-primary/20 bg-lumina-primary/5 flex items-center justify-between group cursor-pointer overflow-hidden relative">
             <div className="relative z-10">
                <h3 className="text-sm font-bold text-lumina-primary mb-1">Generate Export</h3>
                <p className="text-[11px] text-[var(--foreground)] opacity-40 font-medium">Download industrial PDF report.</p>
             </div>
             <ArrowUpRight className="w-5 h-5 text-lumina-primary group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform relative z-10" />
             <PieChart className="absolute right-0 bottom-0 w-20 h-20 text-lumina-primary/10 translate-x-4 translate-y-4" />
          </div>
        </div>
      </div>
    </div>
  );
}
