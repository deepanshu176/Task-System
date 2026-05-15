"use client";

import { useState, useEffect, useRef } from "react";
import { X, Play, Pause, RotateCcw, Zap, Target, Moon, Sun, Volume2, VolumeX } from "lucide-react";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";

export default function FocusMode({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState<'FOCUS' | 'BREAK'>('FOCUS');
  const [isMuted, setIsMuted] = useState(true);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      handleTimerComplete();
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive, timeLeft]);

  const handleTimerComplete = () => {
    setIsActive(false);
    if (timerRef.current) clearInterval(timerRef.current);
    
    if (mode === 'FOCUS') {
      toast.success('Focus session complete! Synchronizing break sequence.', {
        icon: <Zap className="w-4 h-4 text-lumina-primary" />,
        style: { background: '#0A0A0A', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' }
      });
      setMode('BREAK');
      setTimeLeft(5 * 60);
    } else {
      toast.success('Break complete. Ready for next sprint?', {
        style: { background: '#0A0A0A', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' }
      });
      setMode('FOCUS');
      setTimeLeft(25 * 60);
    }
  };

  const toggleTimer = () => setIsActive(!isActive);
  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(mode === 'FOCUS' ? 25 * 60 : 5 * 60);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden animate-in fade-in duration-700">
      {/* Background with animated gradient */}
      <div className="absolute inset-0 bg-[#030303]">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_50%_50%,_rgba(139,92,246,0.3),_transparent_50%)] animate-glow-pulse" />
        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150" />
      </div>

      {/* Top Controls */}
      <div className="absolute top-10 left-10 flex items-center gap-6 z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-lumina-primary/10 flex items-center justify-center text-lumina-primary border border-lumina-primary/20">
            <Target className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-black text-white uppercase tracking-widest">Deep Work Protocol</h2>
            <p className="text-[10px] font-bold text-white/20 uppercase tracking-[0.2em] mt-0.5">Lumina Intelligence v1.0</p>
          </div>
        </div>
      </div>

      <div className="absolute top-10 right-10 flex items-center gap-4 z-10">
        <button 
          onClick={() => setIsMuted(!isMuted)}
          className="p-3 bg-white/5 hover:bg-white/10 rounded-xl text-white/40 hover:text-white transition-all"
        >
          {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
        </button>
        <button 
          onClick={onClose}
          className="p-3 bg-white/5 hover:bg-white/10 rounded-xl text-white/40 hover:text-white transition-all group"
        >
          <X className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
        </button>
      </div>

      {/* Main Timer Display */}
      <div className="relative flex flex-col items-center gap-12 z-10">
        <div className="relative">
          {/* Outer Ring */}
          <div className="w-96 h-96 rounded-full border border-white/5 flex items-center justify-center relative">
             <div 
               className="absolute inset-0 rounded-full border-t-2 border-lumina-primary/50" 
               style={{ 
                 transform: `rotate(${(timeLeft / (mode === 'FOCUS' ? 25 * 60 : 5 * 60)) * 360}deg)`,
                 transition: 'transform 1s linear'
               }}
             />
             <div className="flex flex-col items-center">
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-lumina-primary mb-2">
                  {mode === 'FOCUS' ? 'Neural Sync' : 'Recharge'}
                </span>
                <span className="text-9xl font-black text-white tracking-tighter tabular-nums drop-shadow-[0_0_40px_rgba(139,92,246,0.2)]">
                  {formatTime(timeLeft)}
                </span>
             </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-8">
          <button 
            onClick={resetTimer}
            className="p-5 bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.05] rounded-2xl text-white/40 hover:text-white transition-all"
          >
            <RotateCcw className="w-6 h-6" />
          </button>
          
          <button 
            onClick={toggleTimer}
            className={cn(
              "w-24 h-24 rounded-full flex items-center justify-center transition-all shadow-[0_0_50px_rgba(139,92,246,0.3)] hover:scale-105 active:scale-95",
              isActive ? "bg-white/10 text-white border border-white/20" : "bg-lumina-primary text-white"
            )}
          >
            {isActive ? <Pause className="w-10 h-10 fill-current" /> : <Play className="w-10 h-10 fill-current ml-1" />}
          </button>

          <button 
            onClick={() => {
              setMode(mode === 'FOCUS' ? 'BREAK' : 'FOCUS');
              setTimeLeft(mode === 'FOCUS' ? 5 * 60 : 25 * 60);
              setIsActive(false);
            }}
            className="p-5 bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.05] rounded-2xl text-white/40 hover:text-white transition-all"
          >
            {mode === 'FOCUS' ? <Sun className="w-6 h-6" /> : <Moon className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Quote/Motivation */}
      <div className="absolute bottom-20 text-center z-10 px-8">
        <p className="text-white/20 text-sm font-bold italic tracking-wide max-w-md mx-auto">
          "The distance between your goals and reality is called action. Focus on the craft, let Lumina handle the chaos."
        </p>
      </div>

      {/* Background Text Decorations */}
      <div className="absolute inset-0 flex items-center justify-center overflow-hidden pointer-events-none select-none opacity-[0.02]">
        <h1 className="text-[40rem] font-black text-white leading-none tracking-tighter">LUMINA</h1>
      </div>
    </div>
  );
}
