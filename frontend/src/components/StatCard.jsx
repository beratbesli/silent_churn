import React from 'react';

export default function StatCard({ title, value, icon: Icon, colorClass }) {
  return (
    <div className="bg-white dark:bg-[#141414] rounded-2xl p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-zinc-400 dark:text-zinc-500 mb-1.5 uppercase tracking-wider">{title}</p>
          <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{value}</div>
        </div>
        <div className={`p-2.5 rounded-xl ${colorClass}`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>
    </div>
  );
}
