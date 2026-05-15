import React from 'react';

export default function DashboardLoading() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-2">
          <div className="h-10 w-48 bg-slate-200 rounded-xl" />
          <div className="h-4 w-64 bg-slate-100 rounded-lg" />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white border border-slate-100 p-6 rounded-2xl shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-slate-100 mb-4" />
            <div className="space-y-2">
              <div className="h-3 w-16 bg-slate-100 rounded" />
              <div className="h-10 w-12 bg-slate-200 rounded-lg" />
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        <div className="lg:col-span-2 bg-white border border-slate-100 p-8 rounded-[2.5rem] shadow-sm min-h-[400px]">
          <div className="h-8 w-48 bg-slate-100 rounded-xl mb-8" />
          <div className="space-y-4">
             {[1, 2, 3, 4].map(i => (
               <div key={i} className="h-16 bg-slate-50 rounded-2xl w-full" />
             ))}
          </div>
        </div>
        <div className="lg:col-span-1 bg-white border border-slate-100 p-8 rounded-[2.5rem] shadow-sm">
          <div className="h-8 w-48 bg-slate-100 rounded-xl mb-8" />
          <div className="h-24 w-16 bg-slate-200 rounded-2xl mb-6" />
          <div className="h-4 w-full bg-slate-100 rounded mb-2" />
          <div className="h-4 w-2/3 bg-slate-100 rounded" />
          <div className="mt-12 h-12 w-full bg-slate-100 rounded-2xl" />
        </div>
      </div>
    </div>
  );
}
