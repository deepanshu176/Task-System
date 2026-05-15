"use client";

import { useState, useRef, useEffect } from "react";
import { Zap, Send, X, MessageSquare, Bot, User, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export default function LuminaAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Lumina Intelligence online. How can I assist your workflow today?" }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: "user", content: userMessage }]);
    setIsTyping(true);

    // Simulate AI Response
    setTimeout(() => {
      const aiResponse = getMockAIResponse(userMessage);
      setMessages(prev => [...prev, { role: "assistant", content: aiResponse }]);
      setIsTyping(false);
    }, 1500);
  };

  const getMockAIResponse = (query: string) => {
    const q = query.toLowerCase();
    if (q.includes("task") || q.includes("project")) {
      return "I've analyzed your current task backlog. You have 3 critical paths that require immediate synchronization. Would you like me to prioritize them?";
    }
    if (q.includes("team") || q.includes("member")) {
      return "Operational assignees are currently at 84% capacity. I recommend delaying non-critical tasks to avoid burnout.";
    }
    if (q.includes("burnout")) {
      return "Predictive analytics show a slight decrease in team velocity. I suggest enabling 'Deep Work' mode for the next 4 hours.";
    }
    return "Understood. I am processing your request through the Lumina neural engine. Is there anything specific about your workflow you'd like to optimize?";
  };

  return (
    <>
      {/* Floating Trigger */}
      <button
        onClick={() => setIsOpen(true)}
        className={cn(
          "fixed bottom-8 right-8 w-16 h-16 rounded-2xl bg-lumina-primary text-white shadow-[0_0_30px_rgba(139,92,246,0.4)] flex items-center justify-center transition-all hover:scale-110 active:scale-95 z-50 group overflow-hidden",
          isOpen && "scale-0 opacity-0 pointer-events-none"
        )}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        <Zap className="w-8 h-8 fill-white animate-glow-pulse" />
      </button>

      {/* Chat Window */}
      <div
        className={cn(
          "fixed bottom-8 right-8 w-[400px] h-[600px] glass-panel rounded-[32px] border border-white/[0.08] shadow-[0_20px_80px_rgba(0,0,0,0.6)] flex flex-col z-50 transition-all duration-500 origin-bottom-right",
          !isOpen ? "scale-0 opacity-0 translate-y-20 pointer-events-none" : "scale-100 opacity-100 translate-y-0"
        )}
      >
        {/* Header */}
        <div className="p-6 border-b border-white/[0.05] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-lumina-primary/10 rounded-xl flex items-center justify-center text-lumina-primary border border-lumina-primary/20">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="text-sm font-black text-white uppercase tracking-widest">Lumina AI</h3>
              <div className="flex items-center gap-1.5 mt-0.5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]" />
                <span className="text-[10px] font-bold text-emerald-500/80 uppercase">Autonomous</span>
              </div>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 hover:bg-white/5 rounded-xl text-white/20 hover:text-white transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Messages */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar"
        >
          {messages.map((msg, i) => (
            <div
              key={i}
              className={cn(
                "flex flex-col gap-2 max-w-[85%]",
                msg.role === "user" ? "ml-auto items-end" : "mr-auto items-start"
              )}
            >
              <div className={cn(
                "px-4 py-3 rounded-2xl text-sm font-medium leading-relaxed",
                msg.role === "user" 
                  ? "bg-lumina-primary text-white rounded-tr-none shadow-lg shadow-lumina-primary/10" 
                  : "bg-white/[0.03] text-white/80 border border-white/[0.05] rounded-tl-none"
              )}>
                {msg.content}
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-white/10 px-1">
                {msg.role === "assistant" ? "Lumina" : "You"}
              </span>
            </div>
          ))}
          {isTyping && (
            <div className="mr-auto items-start flex flex-col gap-2">
              <div className="px-4 py-3 rounded-2xl bg-white/[0.03] border border-white/[0.05] rounded-tl-none">
                <div className="flex gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-white/20 animate-bounce" />
                  <div className="w-1.5 h-1.5 rounded-full bg-white/20 animate-bounce [animation-delay:0.2s]" />
                  <div className="w-1.5 h-1.5 rounded-full bg-white/20 animate-bounce [animation-delay:0.4s]" />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <form
          onSubmit={handleSend}
          className="p-6 border-t border-white/[0.05] bg-obsidian-surface/50"
        >
          <div className="relative group">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything about your tasks..."
              className="w-full bg-white/[0.03] border border-white/[0.05] h-12 pl-4 pr-12 rounded-xl text-sm font-bold text-white placeholder:text-white/20 focus:ring-2 focus:ring-lumina-primary/30 transition-all outline-none"
            />
            <button
              type="submit"
              disabled={!input.trim() || isTyping}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg bg-lumina-primary text-white flex items-center justify-center hover:scale-105 transition-all disabled:opacity-0 disabled:scale-90"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
          <p className="text-[9px] text-center mt-4 font-black uppercase tracking-[0.2em] text-white/10">
            Powered by Lumina Neural Engine
          </p>
        </form>
      </div>
    </>
  );
}
