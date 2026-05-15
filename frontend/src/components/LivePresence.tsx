"use client";

import { useEffect, useState } from "react";
import useSWR from "swr";
import api from "@/lib/api";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/authStore";
import { motion, AnimatePresence } from "framer-motion";

const fetcher = (url: string) => api.get(url).then(res => res.data.data || res.data);

export default function LivePresence() {
  const { user } = useAuthStore();
  const { data: usersData } = useSWR('/users?limit=20', fetcher);
  const allUsers = Array.isArray(usersData) ? usersData : usersData?.data || [];
  const users = allUsers.filter((u: any) => u.roleName !== 'ADMIN');
  const [activeIds, setActiveIds] = useState<string[]>([]);
  const [hoveredUser, setHoveredUser] = useState<string | null>(null);

  // Simulate real-time presence changes
  useEffect(() => {
    if (users.length === 0) return;

    // Initialize with some "online" users
    const initialActive = users.slice(0, 4).map((u: any) => u._id || u.id).filter(Boolean);
    setActiveIds(initialActive);

    const interval = setInterval(() => {
      // Randomly toggle someone's presence to simulate live activity
      const randomIndex = Math.floor(Math.random() * users.length);
      const user = users[randomIndex];
      if (!user) return;
      const userId = user._id || user.id;
      if (!userId) return;
      
      setActiveIds(prev => {
        if (prev.includes(userId)) {
          return prev.filter(id => id !== userId);
        } else if (prev.length < 6) {
          return [...prev, userId];
        }
        return prev;
      });
    }, 8000);

    return () => clearInterval(interval);
  }, [users]);

  // Only show for Admins
  if (!user || user.role !== 'ADMIN') return null;
  if (users.length === 0) return null;

  return (
    <div className="flex items-center gap-6 px-6 py-2 bg-white border border-slate-100 rounded-2xl shadow-sm">
      <div className="flex items-center gap-2">
        <div className="relative">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping absolute inset-0" />
          <div className="w-2 h-2 rounded-full bg-emerald-500 relative" />
        </div>
        <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600/80">Live</span>
      </div>

      <div className="flex -space-x-2">
        {users.filter((u: any) => activeIds.includes(u._id || u.id)).map((user: any) => (
          <div 
            key={user._id || user.id} 
            className="relative z-0 hover:z-20"
            onMouseEnter={() => setHoveredUser(user._id || user.id)}
            onMouseLeave={() => setHoveredUser(null)}
          >
            <div className="w-8 h-8 rounded-full border-2 border-white bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-[10px] font-black text-white shadow-md cursor-help transition-transform hover:scale-110">
              {user.name?.charAt(0).toUpperCase()}
            </div>
            
            {/* Presence Pulse */}
            <div className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
            
            {/* Premium Tooltip */}
            <AnimatePresence>
              {hoveredUser === (user._id || user.id) && (
                <motion.div 
                  initial={{ opacity: 0, y: 10, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 5, scale: 0.9 }}
                  className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 px-3 py-1.5 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest rounded-xl whitespace-nowrap pointer-events-none shadow-xl border border-white/10"
                >
                  <div className="relative z-10">{user.name}</div>
                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-900 rotate-45 border-r border-b border-white/10" />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
        
        {users.length > activeIds.length && (
           <div className="w-8 h-8 rounded-full border-2 border-white bg-slate-50 flex items-center justify-center text-[9px] font-black text-slate-400">
              +{users.length - activeIds.length}
           </div>
        )}
      </div>

      <div className="h-4 w-px bg-slate-100" />

      <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">
        <span className="text-slate-900">{users.length}</span> Members Active
      </p>
    </div>
  );
}
