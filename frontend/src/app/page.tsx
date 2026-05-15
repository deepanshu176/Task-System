"use client";

import Link from "next/link";
import { 
  Zap, 
  ArrowRight, 
  CheckCircle2, 
  Users, 
  Shield, 
  BarChart3, 
  Layers,
  ArrowUpRight,
  Globe
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans selection:bg-blue-600/10 selection:text-blue-600 overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[1000px] pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[800px] h-[800px] bg-blue-600/5 blur-[150px] rounded-full opacity-50" />
        <div className="absolute top-[10%] right-[-10%] w-[700px] h-[700px] bg-violet-600/5 blur-[150px] rounded-full opacity-50" />
      </div>

      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-slate-100 bg-white/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3 group cursor-pointer">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-violet-600 rounded-xl flex items-center justify-center text-white shadow-[0_5px_15px_rgba(37,99,235,0.3)] group-hover:scale-110 transition-transform">
              <Zap className="w-6 h-6 fill-current" />
            </div>
            <span className="font-black text-2xl tracking-tighter uppercase text-slate-900">Lumina</span>
          </div>

          <div className="hidden md:flex items-center gap-10">
            {['Features', 'Solutions', 'Ecosystem', 'Docs'].map((item) => (
              <Link key={item} href="#" className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-blue-600 transition-all">{item}</Link>
            ))}
          </div>

          <div className="flex items-center gap-6">
            <Link href="/login" className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-blue-600 transition-all">Sign In</Link>
            <Button asChild className="bg-blue-600 hover:bg-blue-700 text-white font-black text-[10px] uppercase tracking-widest px-8 rounded-2xl h-11 shadow-lg shadow-blue-600/20 transition-all border-none">
              <Link href="/signup">Get Started <ArrowRight className="ml-2 w-4 h-4" /></Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-48 pb-24 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-3 px-4 py-2 bg-blue-50 border border-blue-100 rounded-full mb-12 animate-fade-in">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-600 shadow-[0_0_8px_rgba(37,99,235,0.5)]" />
            <span className="text-[10px] font-black uppercase tracking-widest text-blue-600/80">Streamline your team's workflow</span>
          </div>

          <h1 className="text-5xl md:text-[5.5rem] font-black tracking-tighter leading-[1.1] mb-10 text-slate-900">
            Manage Tasks with <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-violet-600 to-indigo-600">
              Clarity & Speed.
            </span>
          </h1>

          <p className="text-base md:text-lg text-slate-500 font-medium max-w-2xl mx-auto leading-relaxed mb-16 px-4 italic">
            Lumina is the <span className="text-slate-900 font-bold not-italic">next-generation</span> work operating system designed for high-velocity teams. 
            Organize, track, and scale your intelligence with absolute precision.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-8">
            <Button asChild size="lg" className="h-18 px-12 bg-slate-900 text-white hover:bg-slate-800 font-black text-sm uppercase tracking-widest rounded-2xl shadow-[0_20px_40px_rgba(15,23,42,0.1)] transition-all transform hover:-translate-y-1">
              <Link href="/signup">Start Free Trial <ArrowRight className="ml-3 w-6 h-6" /></Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="h-18 px-12 bg-white border-slate-200 hover:bg-slate-50 text-slate-900 font-black text-sm uppercase tracking-widest rounded-2xl transition-all shadow-sm">
              <Link href="/login">Explore Dashboard</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Preview Section */}
      <section className="relative px-6 pb-48">
        <div className="max-w-6xl mx-auto">
          <div className="relative p-1 bg-gradient-to-b from-slate-200 to-transparent rounded-[2.5rem] shadow-2xl shadow-slate-200 overflow-hidden group">
            <div className="bg-white rounded-[2.3rem] overflow-hidden border border-slate-100">
              {/* Mock UI Header */}
              <div className="h-12 bg-slate-50 border-b border-slate-100 flex items-center px-6 gap-2">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-slate-200" />
                  <div className="w-2.5 h-2.5 rounded-full bg-slate-200" />
                  <div className="w-2.5 h-2.5 rounded-full bg-slate-200" />
                </div>
                <div className="mx-auto text-[9px] font-black uppercase tracking-widest text-slate-300">lumina.app/dashboard</div>
              </div>
              
              {/* Mock Content */}
              <div className="p-12 grid grid-cols-1 md:grid-cols-4 gap-8">
                {[
                  { label: 'Total Tasks', value: '248', color: 'text-blue-600', bg: 'bg-blue-50' },
                  { label: 'Completed', value: '186', color: 'text-emerald-600', bg: 'bg-emerald-50' },
                  { label: 'In Progress', value: '42', color: 'text-violet-600', bg: 'bg-violet-50' },
                  { label: 'Overdue', value: '3', color: 'text-rose-600', bg: 'bg-rose-50' }
                ].map((stat) => (
                  <div key={stat.label} className={cn("border border-slate-100 p-8 rounded-[2rem] text-center transition-all hover:shadow-lg hover:shadow-slate-100", stat.bg)}>
                    <div className={stat.color + " text-5xl font-black mb-2 tracking-tighter"}>{stat.value}</div>
                    <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">{stat.label}</div>
                  </div>
                ))}

                <div className="col-span-full mt-12 space-y-4">
                   {[
                     { title: 'Design System Overhaul', status: 'In Progress', priority: 'High', color: 'bg-blue-600' },
                     { title: 'API Documentation', status: 'Completed', priority: 'Medium', color: 'bg-emerald-500' },
                     { title: 'User Authentication Flow', status: 'Pending', priority: 'High', color: 'bg-rose-500' }
                   ].map((task) => (
                     <div key={task.title} className="flex items-center justify-between p-6 bg-slate-50 border border-slate-100 rounded-2xl hover:bg-slate-100 transition-all cursor-default">
                        <div className="flex items-center gap-4">
                           <div className={"w-2 h-2 rounded-full " + task.color} />
                           <span className="font-bold text-base text-slate-700">{task.title}</span>
                        </div>
                        <div className="flex items-center gap-8">
                           <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{task.status}</span>
                           <span className={"text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full border " + (task.priority === 'High' ? 'bg-rose-50 border-rose-100 text-rose-600' : 'bg-amber-50 border-amber-100 text-amber-600')}>{task.priority}</span>
                        </div>
                     </div>
                   ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 px-6 relative bg-white border-y border-slate-100">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-16">
          {[
            { icon: Layers, title: 'Intelligent Layering', desc: 'Organize complex projects into actionable hierarchies with nested tasks and sub-milestones.' },
            { icon: Users, title: 'Real-time Presence', desc: 'See who is online and active in each project with live presence indicators and team heatmaps.' },
            { icon: BarChart3, title: 'Precision Analytics', desc: 'Track velocity, burnout rates, and team efficiency with high-fidelity performance metrics.' }
          ].map((feature, i) => (
            <div key={i} className="group">
              <div className="w-14 h-14 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center mb-8 group-hover:border-blue-600 transition-colors shadow-sm">
                <feature.icon className="w-7 h-7 text-blue-600" />
              </div>
              <h3 className="text-xl font-black mb-4 text-slate-800">{feature.title}</h3>
              <p className="text-slate-500 font-medium leading-relaxed italic">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="py-24 px-6 border-t border-slate-100 bg-slate-50">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-12">
          <div className="flex items-center gap-3">
            <Zap className="w-8 h-8 text-blue-600 fill-current" />
            <span className="font-black text-2xl tracking-tighter uppercase text-slate-900">Lumina</span>
          </div>
          <div className="flex gap-12">
            {['Twitter', 'Github', 'Status', 'Legal'].map((item) => (
              <Link key={item} href="#" className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-blue-600 transition-all">{item}</Link>
            ))}
          </div>
          <div className="text-[10px] font-black uppercase tracking-widest text-slate-300">
            © 2026 Lumina Work OS. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
