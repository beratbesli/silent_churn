import React from 'react';
import { Mail, MapPin, Utensils, ArrowDownLeft, ArrowUpRight } from 'lucide-react';

export default function TimelineItem({ item }) {
  const getIcon = () => {
    switch (item.source) {
      case 'email': return <Mail className="w-3 h-3" />;
      case 'maps': return <MapPin className="w-3 h-3" />;
      case 'food': return <Utensils className="w-3 h-3" />;
      default:     return <Mail className="w-3 h-3" />;
    }
  };

  const getSourceBadge = () => {
    switch (item.source) {
      case 'email': return 'bg-indigo-100 dark:bg-indigo-900/70 text-indigo-600 dark:text-indigo-400';
      case 'maps':  return 'bg-amber-100 dark:bg-amber-900/70 text-amber-600 dark:text-amber-400';
      case 'food':  return 'bg-rose-100 dark:bg-rose-900/70 text-rose-600 dark:text-rose-400';
      default:      return 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500';
    }
  };

  const getSentimentColor = () => {
    if (item.sentiment < 40) return 'text-rose-500 dark:text-rose-400';
    if (item.sentiment < 70) return 'text-amber-500 dark:text-amber-400';
    return 'text-emerald-500 dark:text-emerald-400';
  };

  const isOutbound = item.source === 'email' && item.direction === 'outbound';

  return (
    <div className={`flex flex-col mb-4 ${isOutbound ? 'items-end' : 'items-start'}`}>
      <div className="max-w-[90%] md:max-w-[75%]">

        <div className={`flex items-center gap-2 mb-1.5 ${isOutbound ? 'justify-end' : 'justify-start'}`}>
          <span className="text-[11px] text-zinc-400">{item.date}</span>
          <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] uppercase font-semibold ${getSourceBadge()}`}>
            {getIcon()}
            <span>{item.source}</span>
          </div>
          {item.source === 'email' && (
            <div className="text-zinc-400">
              {isOutbound ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownLeft className="w-3 h-3" />}
            </div>
          )}
          {item.sentiment != null && (
            <span className={`text-[11px] font-semibold ${getSentimentColor()}`}>
              {item.sentiment}
            </span>
          )}
        </div>

        <div className={`p-4 rounded-2xl shadow-sm ${
          isOutbound
            ? 'bg-zinc-200 dark:bg-[#2b2b32] rounded-tr-sm'
            : 'bg-zinc-100 dark:bg-[#232328] rounded-tl-sm'
        }`}>
          {item.subject && (
            <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-1.5">{item.subject}</h4>
          )}
          <p className="text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed whitespace-pre-wrap">
            {item.content}
          </p>
          {item.analysisReason && (
            <div className="mt-3 pt-2.5 border-t border-zinc-200 dark:border-zinc-700">
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 italic leading-relaxed">
                {item.analysisReason}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
