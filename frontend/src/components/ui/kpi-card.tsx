'use client';

import { motion } from 'framer-motion';
import { ArrowUpIcon, ArrowDownIcon, TrendingUpIcon } from 'lucide-react';
import { cn, formatNumber, formatPercent } from '@/lib/utils';

export interface KPICardProps {
  title: string;
  value: number | string;
  previousValue?: number;
  format?: 'number' | 'percent' | 'currency' | 'rating';
  trend?: {
    value: number;
    isPositive: boolean;
    label?: string;
  };
  sentiment?: 'positive' | 'neutral' | 'negative';
  size?: 'default' | 'hero';
  icon?: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export function KPICard({
  title,
  value,
  previousValue,
  format = 'number',
  trend,
  sentiment,
  size = 'default',
  icon,
  className,
  onClick,
}: KPICardProps) {
  const formatValue = (val: number | string): string => {
    if (typeof val === 'string') return val;

    switch (format) {
      case 'percent':
        return formatPercent(val);
      case 'currency':
        return `${formatNumber(val)} FCFA`;
      case 'rating':
        return `${val.toFixed(1)} / 5`;
      default:
        return formatNumber(val);
    }
  };

  const sentimentColors = {
    positive: 'bg-primary-600',
    neutral: 'bg-amber-500',
    negative: 'bg-red-500',
  };

  const isHero = size === 'hero';
  const isClickable = onClick !== undefined;

  return (
    <motion.div
      className={cn(
        'relative overflow-hidden rounded-2xl border bg-white p-6 transition-all duration-200 dark:bg-slate-900',
        'border-slate-200 dark:border-slate-800',
        isClickable && 'cursor-pointer hover:border-primary-300 hover:shadow-lg hover:shadow-primary-600/5 dark:hover:border-primary-700',
        isHero && 'col-span-2 p-8',
        className
      )}
      onClick={onClick}
      whileHover={isClickable ? { y: -2 } : {}}
      transition={{ duration: 0.15, ease: [0.23, 1, 0.32, 1] }}
    >
      {/* Sentiment indicator bar */}
      {sentiment && (
        <div className={cn('absolute left-0 right-0 top-0 h-1', sentimentColors[sentiment])} />
      )}

      {/* Icon */}
      {icon && (
        <div className="mb-4 inline-flex rounded-xl bg-primary-50 p-3 text-primary-600 dark:bg-primary-900/20 dark:text-primary-400">
          {icon}
        </div>
      )}

      {/* Value */}
      <div className={cn(
        'font-mono font-semibold text-slate-900 dark:text-white',
        isHero ? 'text-5xl' : 'text-3xl'
      )}>
        {formatValue(value)}
      </div>

      {/* Title */}
      <div className="mt-2 text-sm font-medium text-slate-600 dark:text-slate-400">
        {title}
      </div>

      {/* Trend */}
      {trend && (
        <div className={cn(
          'mt-3 flex items-center gap-1 text-sm font-medium',
          trend.isPositive
            ? 'text-primary-600 dark:text-primary-400'
            : 'text-red-600 dark:text-red-400'
        )}>
          {trend.isPositive ? (
            <ArrowUpIcon className="h-4 w-4" />
          ) : (
            <ArrowDownIcon className="h-4 w-4" />
          )}
          <span>{formatPercent(Math.abs(trend.value), 1)}</span>
          {trend.label && <span className="text-slate-500">· {trend.label}</span>}
        </div>
      )}

      {/* Sparkline placeholder (future enhancement) */}
      {isHero && previousValue !== undefined && (
        <div className="mt-4 h-16 w-full rounded-lg bg-slate-100 dark:bg-slate-800" />
      )}
    </motion.div>
  );
}
