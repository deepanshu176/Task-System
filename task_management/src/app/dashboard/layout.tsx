"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import AuthGuard from "@/components/AuthGuard";
import { 
  LayoutDashboard, 
  FolderKanban, 
  CheckSquare, 
  Users, 
  LogOut,
  Bell,
  Settings,
  Zap,
  BarChart3,
  Search,
} from "lucide-react";
import { cn } from "@/lib/utils";
import LivePresence from "@/components/LivePresence";
import ThemeToggle from "@/components/ThemeToggle";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Projects', href: '/dashboard/projects', icon: FolderKanban },
    { name: 'Tasks', href: '/dashboard/tasks', icon: CheckSquare },
    { name: 'Team', href: '/dashboard/team', icon: Users, perm: 'MANAGE_USERS' },
    { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart3, perm: 'MANAGE_USERS' },
  ];


  return (
    <AuthGuard>
      <div className="flex h-screen bg-[#F8FAFC] overflow-hidden font-sans text-slate-900 dark:bg-slate-950 dark:text-slate-100">
        
        {/* Sidebar */}
        <aside className={cn(
          "bg-white border-r border-slate-100 transition-all duration-300 flex flex-col z-30 dark:bg-slate-950 dark:border-slate-800",
          "w-64"
        )}>
          <div className="px-6 h-16 flex items-center border-b border-slate-100 dark:border-slate-800">
            <a
              href="/dashboard"
              className="flex items-center gap-3 rounded-xl text-left"
              aria-label="Go to dashboard"
            >
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white shadow-lg shadow-blue-600/20">
                <Zap className="w-5 h-5 fill-current" />
              </div>
              <span className="font-black text-xl tracking-tighter text-slate-900 dark:text-white">Lumina</span>
            </a>
          </div>
          
          <nav className="flex-1 p-4 space-y-1">
            {navItems.map((item) => {
              const hasAccess = !item.perm || user?.permissions?.includes(item.perm) || user?.role === 'ADMIN';
              if (!hasAccess) return null;
              
              const isActive = pathname === item.href;
              const Icon = item.icon;
              
              return (
                <a
                  key={item.name}
                  href={item.href}
                  aria-current={isActive ? 'page' : undefined}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left transition-all group",
                    isActive 
                      ? "bg-blue-600/10 text-blue-600 shadow-sm shadow-blue-600/5" 
                      : "text-slate-500 hover:text-slate-900 hover:bg-slate-50 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-900"
                  )}
                >
                  <span className={cn(
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors",
                    isActive ? "text-blue-600" : "text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200"
                  )}>
                    <Icon className="h-5 w-5" />
                  </span>
                  <span className={cn("text-sm font-medium", isActive && "font-black")}>{item.name}</span>
                </a>
              );
            })}
          </nav>

          <div className="p-4 border-t border-slate-100 dark:border-slate-800">
             <div className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-100 rounded-2xl dark:bg-slate-900 dark:border-slate-800">
                <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black text-sm shadow-sm">
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
                <div className="overflow-hidden">
                  <p className="text-xs font-black text-slate-900 truncate dark:text-white">{user?.name}</p>
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Workspace {user?.role}</p>
                </div>
             </div>
          </div>
        </aside>

        {/* Content */}
        <div className="flex-1 flex flex-col h-screen overflow-hidden">
          <header className="h-16 bg-white border-b border-slate-100 flex items-center justify-between px-8 z-20 dark:bg-slate-950 dark:border-slate-800">
            <div className="flex items-center gap-4">
               <div className="relative group hidden md:block">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                  <input 
                    placeholder="Search projects..."
                    className="pl-10 pr-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-xs font-medium outline-none focus:ring-2 focus:ring-blue-600/10 focus:border-blue-600/30 w-72 transition-all dark:bg-slate-900 dark:border-slate-800 dark:text-white"
                  />
               </div>
               <LivePresence />
            </div>
            
            <div className="flex items-center gap-2 relative">
              <button 
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                className={cn(
                  "p-2 rounded-xl transition-all relative group",
                  isNotificationsOpen ? "bg-blue-600/10 text-blue-600" : "hover:bg-slate-50 text-slate-400 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-white"
                )}
              >
                <Bell className="w-4.5 h-4.5" />
                <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-rose-500 rounded-full border-2 border-white shadow-sm" />
              </button>

              {/* Notifications Popover */}
              {isNotificationsOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsNotificationsOpen(false)} />
                  <div className="absolute top-full right-0 mt-4 w-80 bg-white border border-slate-100 rounded-[2rem] shadow-[0_20px_50px_-12px_rgba(15,23,42,0.2)] z-50 overflow-hidden dark:bg-slate-950 dark:border-slate-800">
                    <div className="p-6 border-b border-slate-50 flex items-center justify-between dark:border-slate-800">
                      <h4 className="font-black text-xs uppercase tracking-widest text-slate-900 dark:text-white">Notifications</h4>
                      <button className="text-[10px] font-black text-blue-600 hover:text-blue-700 transition-colors">Clear All</button>
                    </div>
                    <div className="max-h-80 overflow-y-auto no-scrollbar">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="p-6 hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0 cursor-pointer group dark:hover:bg-slate-900 dark:border-slate-800">
                           <div className="flex gap-4">
                              <div className="w-9 h-9 rounded-xl bg-blue-600/10 flex items-center justify-center text-blue-600 font-black text-[10px] flex-shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-all">
                                 {i === 1 ? 'JD' : i === 2 ? 'AS' : 'LM'}
                              </div>
                              <div className="space-y-1">
                                 <p className="text-xs font-bold text-slate-900 leading-tight dark:text-white">
                                    {i === 1 ? 'John Doe assigned you to a new task' : i === 2 ? 'System Update: Redis Caching Active' : 'Task "Deploy to Production" completed'}
                                 </p>
                                 <p className="text-[10px] text-slate-400 font-medium italic">2 hours ago</p>
                              </div>
                           </div>
                        </div>
                      ))}
                    </div>
                    <div className="p-4 bg-slate-50 text-center dark:bg-slate-900">
                       <button className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-900 transition-colors dark:hover:text-white">View All Activity</button>
                    </div>
                  </div>
                </>
              )}
              <ThemeToggle />
              <Link href="/dashboard/settings" className="p-2 rounded-xl hover:bg-slate-50 text-slate-400 hover:text-slate-900 transition-colors dark:hover:bg-slate-800 dark:hover:text-white">
                <Settings className="w-4.5 h-4.5" />
              </Link>
              <div className="h-4 w-px bg-slate-100 mx-2 dark:bg-slate-800" />
              <button onClick={handleLogout} className="p-2 rounded-xl hover:bg-rose-50 text-rose-500 transition-colors">
                <LogOut className="w-4.5 h-4.5" />
              </button>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto p-8 bg-[#F8FAFC] dark:bg-slate-950">
            <div className="max-w-6xl mx-auto">
              {children}
            </div>
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}
