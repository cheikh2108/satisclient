'use client';

import { cn } from '@/lib/utils';

interface KPICardPremiumProps {
  label: string;
  value: string;
  subtitle?: string;
  change: string;
  changeLabel?: string;
  sparklineData?: number[];
  className?: string;
}

export default function KPICardPremium({
  label,
  value,
  subtitle,
  change,
  changeLabel = 'last year',
  sparklineData = [20, 30, 25, 40, 35, 50, 45, 60, 55, 70],
  className,
}: KPICardPremiumProps) {
  const max = Math.max(...sparklineData);
  const min = Math.min(...sparklineData);
  const range = max - min || 1;

  return (
    <div
      className={cn(
        'relative flex flex-col rounded-[14px] border border-[#EAEAEA] dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)]',
        className
      )}
    >
      {/* Label */}
      <div className="mb-4">
        <p className="text-[11px] font-semibold uppercase tracking-[0.05em] text-slate-500 dark:text-slate-400">
          {label}
        </p>
      </div>

      {/* Value + Sparkline */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[32px] font-semibold leading-none text-slate-900 dark:text-white">
            {value}
          </p>
          {subtitle && (
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{subtitle}</p>
          )}
        </div>

        {/* Mini Sparkline */}
        <div className="flex h-12 items-end gap-[2px] ml-4">
          {sparklineData.map((val, i) => {
            const height = ((val - min) / range) * 100;
            return (
              <div
                key={i}
                className="w-[3px] rounded-t-[1px] bg-slate-200 dark:bg-slate-700"
                style={{ height: `${Math.max(height, 10)}%` }}
              />
            );
          })}
        </div>
      </div>

      {/* Change Indicator */}
      <div className="mt-6 flex items-center gap-2">
        <div className="h-2 w-2 rounded-full bg-emerald-500" />
        <p className="text-sm text-slate-600 dark:text-slate-400">
          <span className="font-medium text-slate-900 dark:text-white">{change}</span>{' '}
          {changeLabel}
        </p>
      </div>
    </div>
  );
}
