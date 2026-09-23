'use client';

import { ChevronDown } from 'lucide-react';

export function WorkspaceSelector() {
  return (
    <button className="flex w-full items-center gap-3 rounded-xl border border-slate-200 dark:border-slate-800/60 bg-white dark:bg-[#1a1a1a] p-3 transition-all hover:border-slate-300 dark:hover:border-slate-700/80 active:scale-[0.98]">
      <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-slate-900 dark:bg-white">
        <span className="text-sm font-bold text-white dark:text-slate-900">SC</span>
      </div>
      <div className="flex-1 text-left">
        <p className="text-[10px] font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
          Agency
        </p>
        <p className="text-sm font-semibold text-slate-900 dark:text-white">
          Spark Pixel Team
        </p>
      </div>
      <ChevronDown className="h-4 w-4 text-slate-400" />
    </button>
  );
}
