'use client';

import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid } from 'recharts';
import { cn } from '@/lib/utils';

const data = {
  weekly: [
    { period: 'Lun', nouveaux: 45, existants: 78 },
    { period: 'Mar', nouveaux: 52, existants: 85 },
    { period: 'Mer', nouveaux: 48, existants: 72 },
    { period: 'Jeu', nouveaux: 61, existants: 91 },
    { period: 'Ven', nouveaux: 55, existants: 88 },
    { period: 'Sam', nouveaux: 38, existants: 65 },
    { period: 'Dim', nouveaux: 32, existants: 58 },
  ],
  monthly: [
    { period: 'Jan', nouveaux: 280, existants: 520 },
    { period: 'Fév', nouveaux: 310, existants: 580 },
    { period: 'Mar', nouveaux: 295, existants: 610 },
    { period: 'Avr', nouveaux: 340, existants: 650 },
    { period: 'Mai', nouveaux: 380, existants: 720 },
    { period: 'Juin', nouveaux: 420, existants: 780 },
    { period: 'Juil', nouveaux: 390, existants: 710 },
    { period: 'Août', nouveaux: 350, existants: 680 },
    { period: 'Sep', nouveaux: 410, existants: 750 },
    { period: 'Oct', nouveaux: 450, existants: 820 },
    { period: 'Nov', nouveaux: 430, existants: 790 },
    { period: 'Déc', nouveaux: 480, existants: 850 },
  ],
  yearly: [
    { period: '2020', nouveaux: 2800, existants: 5200 },
    { period: '2021', nouveaux: 3400, existants: 6100 },
    { period: '2022', nouveaux: 3900, existants: 6800 },
    { period: '2023', nouveaux: 4500, existants: 7600 },
    { period: '2024', nouveaux: 5100, existants: 8400 },
    { period: '2025', nouveaux: 5800, existants: 9200 },
  ],
};

type Period = 'weekly' | 'monthly' | 'yearly';

interface SalesTrendChartProps {
  title?: string;
  subtitle?: string;
  className?: string;
}

export default function SalesTrendChart({
  title = 'Tendance des Feedbacks',
  subtitle,
  className = '',
}: SalesTrendChartProps) {
  const [period, setPeriod] = useState<Period>('monthly');

  const chartData = data[period];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 shadow-lg">
          <p className="mb-2 font-medium text-slate-900 dark:text-white">{label}</p>
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm">
              <div className="h-2 w-2 rounded-full bg-primary-600" />
              <span className="text-slate-600 dark:text-slate-400">Nouveaux Clients :</span>
              <span className="font-medium text-slate-900 dark:text-white">
                {payload[0].value.toLocaleString()}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <div className="h-2 w-2 rounded-full bg-slate-800 dark:bg-slate-400" />
              <span className="text-slate-600 dark:text-slate-400">Clients Existants :</span>
              <span className="font-medium text-slate-900 dark:text-white">
                {payload[1].value.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className={cn('rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6', className)}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
            {title}
            <span className="text-slate-400">●</span>
          </h3>
          {subtitle && (
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{subtitle}</p>
          )}
        </div>

        {/* Period Toggle */}
        <div className="flex items-center gap-2 p-1 rounded-lg bg-slate-100 dark:bg-slate-800">
          <button
            onClick={() => setPeriod('weekly')}
            className={cn(
              'px-4 py-2 text-sm font-medium rounded-md transition-all duration-150',
              period === 'weekly'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            )}
          >
            Semaine
          </button>
          <button
            onClick={() => setPeriod('monthly')}
            className={cn(
              'px-4 py-2 text-sm font-medium rounded-md transition-all duration-150',
              period === 'monthly'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            )}
          >
            Mois
          </button>
          <button
            onClick={() => setPeriod('yearly')}
            className={cn(
              'px-4 py-2 text-sm font-medium rounded-md transition-all duration-150',
              period === 'yearly'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            )}
          >
            Année
          </button>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 mb-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-primary-600" />
          <span className="font-medium text-slate-900 dark:text-white">Nouveaux Clients</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-slate-800 dark:bg-slate-400" />
          <span className="font-medium text-slate-900 dark:text-white">Clients Existants</span>
        </div>
      </div>

      {/* Chart */}
      <div className="h-[400px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} barGap={0} barCategoryGap="20%">
            <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-slate-200 dark:text-slate-800" vertical={false} />
            <XAxis
              dataKey="period"
              stroke="currentColor"
              className="text-slate-600 dark:text-slate-400"
              tick={{ fontSize: 12 }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="currentColor"
              className="text-slate-600 dark:text-slate-400"
              tick={{ fontSize: 12 }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `${value / 1000}k`}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(148, 163, 184, 0.1)' }} />
            <Bar dataKey="nouveaux" fill="#3a5a40" radius={[4, 4, 0, 0]} />
            <Bar dataKey="existants" fill="currentColor" className="text-slate-800 dark:text-slate-400" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
