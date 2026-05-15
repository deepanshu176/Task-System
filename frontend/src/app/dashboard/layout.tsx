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
  Shield,
  LogOut,
  Bell,
  Search,
  Settings,
  UserCircle,
  CheckCircle2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [openMenu, setOpenMenu] = useState<'notifications' | 'settings' | null>(null);
  const [hasUnreadNotifications, setHasUnreadNotifications] = useState(true);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const closeMenu = () => setOpenMenu(null);

  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Projects', href: '/dashboard/projects', icon: FolderKanban },
    { name: 'Tasks', href: '/dashboard/tasks', icon: CheckSquare },
    { name: 'Team', href: '/dashboard/team', icon: Users, perm: 'MANAGE_USERS' },
    { name: 'Roles', href: '/dashboard/roles', icon: Shield, perm: 'MANAGE_USERS' },
  ];

  return (
    <AuthGuard>
      <div className="flex h-screen bg-[#FAFAFA] font-sans text-gray-900">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r border-gray-200/60 hidden md:flex flex-col shadow-sm z-10">
          <div className="p-6 flex items-center gap-3 border-b border-gray-100">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-inner shadow-blue-400">
              <span className="text-white font-bold text-lg">T</span>
            </div>
            <h1 className="text-xl font-bold text-gray-900 tracking-tight">TaskFlow</h1>
          </div>
          
          <div className="px-4 py-4">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-2">Menu</p>
            <nav className="flex-1 space-y-1">
              {navItems.map((item) => {
                const hasAccess = !item.perm || user?.permissions?.includes(item.perm) || user?.role === 'ADMIN';
                if (!hasAccess) return null;
                
                const isActive = pathname === item.href;
                const Icon = item.icon;
                
                return (
                  <Link key={item.name} href={item.href}>
                    <div className={cn(
                      "flex items-center space-x-3 px-3 py-2.5 rounded-xl transition-all duration-200",
                      isActive 
                        ? "bg-blue-50 text-blue-700 shadow-sm border border-blue-100" 
                        : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                    )}>
                      <Icon className={cn("w-5 h-5", isActive ? "text-blue-600" : "text-gray-400")} />
                      <span className="font-medium text-sm">{item.name}</span>
                    </div>
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="mt-auto p-4 border-t border-gray-100">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100 mb-2">
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white font-bold shadow-sm">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <div className="overflow-hidden flex-1">
                <p className="text-sm font-semibold text-gray-900 truncate">{user?.name}</p>
                <p className="text-xs text-gray-500 truncate">{user?.role || 'User'}</p>
              </div>
            </div>
            <button 
              onClick={handleLogout}
              className="flex w-full items-center space-x-3 px-3 py-2.5 rounded-xl text-gray-500 hover:bg-red-50 hover:text-red-600 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span className="font-medium text-sm">Logout</span>
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
          
          {/* Top Navbar */}
          <header className="h-16 bg-white/80 backdrop-blur-md border-b border-gray-200/60 flex items-center justify-between px-8 sticky top-0 z-20">
            <div className="flex items-center gap-4 w-96">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input 
                  placeholder="Search projects, tasks..." 
                  className="pl-9 bg-gray-50 border-gray-200 h-9 rounded-full text-sm focus-visible:ring-1 focus-visible:ring-blue-500 focus-visible:bg-white transition-all"
                />
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="relative">
                <button
                  onClick={() => setOpenMenu(openMenu === 'notifications' ? null : 'notifications')}
                  className={cn(
                    "relative p-2 rounded-full transition-colors",
                    openMenu === 'notifications' ? "text-blue-600 bg-blue-50" : "text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                  )}
                  aria-label="Notifications"
                >
                  <Bell className="w-5 h-5" />
                  {hasUnreadNotifications && (
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white"></span>
                  )}
                </button>
                {openMenu === 'notifications' && (
                  <div className="absolute right-0 top-12 w-80 rounded-xl border border-gray-200 bg-white shadow-xl z-50 overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                      <h3 className="text-sm font-semibold text-gray-900">Notifications</h3>
                      {hasUnreadNotifications && (
                        <button
                          onClick={() => setHasUnreadNotifications(false)}
                          className="text-xs font-medium text-blue-600 hover:text-blue-700"
                        >
                          Mark read
                        </button>
                      )}
                    </div>
                    <div className="p-2">
                      {hasUnreadNotifications ? (
                        <button
                          onClick={() => {
                            setHasUnreadNotifications(false);
                            closeMenu();
                            router.push('/dashboard/tasks');
                          }}
                          className="w-full text-left rounded-lg px-3 py-3 hover:bg-gray-50 transition-colors"
                        >
                          <p className="text-sm font-medium text-gray-900">Task board is ready</p>
                          <p className="text-xs text-gray-500 mt-1">Open the task board to review current tasks.</p>
                        </button>
                      ) : (
                        <div className="flex flex-col items-center justify-center px-4 py-8 text-center">
                          <CheckCircle2 className="w-8 h-8 text-green-500 mb-2" />
                          <p className="text-sm font-medium text-gray-900">All caught up</p>
                          <p className="text-xs text-gray-500 mt-1">No unread notifications.</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="relative">
                <button
                  onClick={() => setOpenMenu(openMenu === 'settings' ? null : 'settings')}
                  className={cn(
                    "p-2 rounded-full transition-colors",
                    openMenu === 'settings' ? "text-blue-600 bg-blue-50" : "text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                  )}
                  aria-label="Settings"
                >
                  <Settings className="w-5 h-5" />
                </button>
                {openMenu === 'settings' && (
                  <div className="absolute right-0 top-12 w-72 rounded-xl border border-gray-200 bg-white shadow-xl z-50 overflow-hidden">
                    <div className="px-4 py-4 border-b border-gray-100">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white font-bold">
                          {user?.name?.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-gray-900 truncate">{user?.name}</p>
                          <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                        </div>
                      </div>
                    </div>
                    <div className="p-2">
                      <Link href="/dashboard" onClick={closeMenu} className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50">
                        <UserCircle className="w-4 h-4 text-gray-400" />
                        Profile overview
                      </Link>
                      {(user?.permissions?.includes('MANAGE_USERS') || user?.role === 'ADMIN') && (
                        <Link href="/dashboard/team" onClick={closeMenu} className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50">
                          <Users className="w-4 h-4 text-gray-400" />
                          Manage team
                        </Link>
                      )}
                      {(user?.permissions?.includes('MANAGE_USERS') || user?.role === 'ADMIN') && (
                        <Link href="/dashboard/roles" onClick={closeMenu} className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50">
                          <Shield className="w-4 h-4 text-gray-400" />
                          Roles and permissions
                        </Link>
                      )}
                    </div>
                    <div className="p-2 border-t border-gray-100">
                      <button
                        onClick={handleLogout}
                        className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50"
                      >
                        <LogOut className="w-4 h-4" />
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </header>

          {/* Scrollable Content */}
          <main className="flex-1 overflow-y-auto bg-[#FAFAFA] p-8">
            <div className="max-w-6xl mx-auto">
              {children}
            </div>
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}
