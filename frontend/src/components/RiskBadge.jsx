import React from 'react';

export default function RiskBadge({ status }) {
  const getStyles = () => {
    switch (status?.toLowerCase()) {
      case 'healthy':
        return 'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300';
      case 'warning':
        return 'bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300';
      case 'at risk':
      case 'at-risk':
      case 'at_risk':
        return 'bg-rose-100 dark:bg-rose-900/60 text-rose-700 dark:text-rose-300';
      default:
        return 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400';
    }
  };

  const formattedStatus = status?.replace('_', ' ') || 'Unknown';

  return (
    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${getStyles()} capitalize tracking-wide`}>
      {formattedStatus}
    </span>
  );
}
