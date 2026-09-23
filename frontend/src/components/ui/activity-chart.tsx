'use client';

import { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';

// Données mensuelles réalistes
const monthlyData = [
  { month: 'Jan', feedbacks: 2100, satisfaction: 72, réclamations: 45 },
  { month: 'Fév', feedbacks: 2350, satisfaction: 73, réclamations: 42 },
  { month: 'Mar', feedbacks: 2680, satisfaction: 75, réclamations: 38 },
  { month: 'Avr', feedbacks: 2890, satisfaction: 76, réclamations: 35 },
  { month: 'Mai', feedbacks: 3150, satisfaction: 78, réclamations: 32 },
  { month: 'Juin', feedbacks: 3420, satisfaction: 80, réclamations: 28 },
];

const weeklyData = [
  { week: 'S1', feedbacks: 720, satisfaction: 78, réclamations: 8 },
  { week: 'S2', feedbacks: 765, satisfaction: 79, réclamations: 7 },
  { week: 'S3', feedbacks: 810, satisfaction: 80, réclamations: 6 },
  { week: 'S4', feedbacks: 845, satisfaction: 81, réclamations: 5 },
];

type Period = 'weekly' | 'monthly';

export default function ActivityChart() {
  const [period, setPeriod] = useState<Period>('monthly');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const data = period === 'monthly' ? monthlyData : weeklyData;
  const latest = data[data.length - 1];
  const previous = data[data.length - 2];

  const feedbackChange = latest.feedbacks - previous.feedbacks;
  const satisfactionChange = latest.satisfaction - previous.satisfaction;
  const feedbackPercent = ((feedbackChange / previous.feedbacks) * 100).toFixed(1);
  const satisfactionPercent = ((satisfactionChange / previous.satisfaction) * 100).toFixed(1);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="rounded-xl border border-slate-200/80 dark:border-slate-700/60 bg-white/95 dark:bg-[#1a1a1a]/95 backdrop-blur-sm p-3 shadow-xl">
          <p className="mb-2 text-xs font-semibold text-slate-900 dark:text-white">
            {data.month || data.week}
          </p>
          <div className="space-y-1.5 text-xs">
            <div className="flex items-center justify-between gap-4">
              <span className="text-slate-600 dark:text-slate-400">Feedbacks</span>
              <span className="font-semibold text-slate-900 dark:text-white tabular-nums">
                {data.feedbacks.toLocaleString()}
              </span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-slate-600 dark:text-slate-400">Satisfaction</span>
              <span className="font-semibold text-primary-600 dark:text-primary-400 tabular-nums">
                {data.satisfaction}%
              </span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-slate-600 dark:text-slate-400">Réclamations</span>
              <span className="font-semibold text-amber-600 dark:text-amber-400 tabular-nums">
                {data.réclamations}
              </span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800/60 bg-white dark:bg-[#111111] p-4 sm:p-6 shadow-sm">
      {/* Header */}
      <div className="flex flex-col gap-4 mb-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-1">
            Vue d'ensemble de l'activité
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-400">
            Évolution des feedbacks et satisfaction client
          </p>
        </div>

        {/* Period Selector */}
        <div className="flex items-center gap-1 rounded-lg bg-slate-100 dark:bg-[#0f0f0f] p-1 w-fit border border-transparent dark:border-slate-800/40">
          {(['weekly', 'monthly'] as Period[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={cn(
                'px-4 py-1.5 text-xs font-medium rounded-md transition-all capitalize active:scale-95',
                period === p
                  ? 'bg-white dark:bg-[#1a1a1a] text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              )}
            >
              {p === 'weekly' ? 'Semaine' : 'Mois'}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="rounded-lg bg-slate-50 dark:bg-[#0f0f0f] p-3 border border-slate-200/50 dark:border-slate-800/40">
          <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">Total Feedbacks</p>
          <div className="flex items-end gap-2">
            <p className="text-xl font-bold text-slate-900 dark:text-white tabular-nums">
              {latest.feedbacks.toLocaleString()}
            </p>
            <div className={cn(
              'flex items-center gap-0.5 text-xs font-medium mb-0.5',
              feedbackChange >= 0 ? 'text-primary-600 dark:text-primary-400' : 'text-red-600 dark:text-red-400'
            )}>
              {feedbackChange >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              {Math.abs(Number(feedbackPercent))}%
            </div>
          </div>
        </div>

        <div className="rounded-lg bg-slate-50 dark:bg-[#0f0f0f] p-3 border border-slate-200/50 dark:border-slate-800/40">
          <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">Satisfaction</p>
          <div className="flex items-end gap-2">
            <p className="text-xl font-bold text-primary-600 dark:text-primary-400 tabular-nums">
              {latest.satisfaction}%
            </p>
            <div className={cn(
              'flex items-center gap-0.5 text-xs font-medium mb-0.5',
              satisfactionChange >= 0 ? 'text-primary-600 dark:text-primary-400' : 'text-red-600 dark:text-red-400'
            )}>
              {satisfactionChange >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              {Math.abs(Number(satisfactionPercent))}%
            </div>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="h-[300px] sm:h-[350px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="feedbackGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3a5a40" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#3a5a40" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="satisfactionGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#60a5fa" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#60a5fa" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="currentColor"
              className="text-slate-200 dark:text-slate-800/30"
              vertical={false}
            />
            <XAxis
              dataKey={period === 'monthly' ? 'month' : 'week'}
              stroke="currentColor"
              className="text-slate-400 dark:text-slate-500"
              tick={{ fontSize: 12 }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              yAxisId="left"
              stroke="currentColor"
              className="text-slate-400 dark:text-slate-500"
              tick={{ fontSize: 11 }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              stroke="currentColor"
              className="text-slate-400 dark:text-slate-500"
              tick={{ fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `${value}%`}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#94a3b8', strokeWidth: 1, strokeDasharray: '5 5' }} />
            <Area
              yAxisId="left"
              type="monotone"
              dataKey="feedbacks"
              stroke="#3a5a40"
              strokeWidth={2.5}
              fill="url(#feedbackGradient)"
              dot={{ fill: '#3a5a40', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, strokeWidth: 0 }}
            />
            <Area
              yAxisId="right"
              type="monotone"
              dataKey="satisfaction"
              stroke="#60a5fa"
              strokeWidth={2}
              fill="url(#satisfactionGradient)"
              dot={{ fill: '#60a5fa', strokeWidth: 2, r: 3 }}
              activeDot={{ r: 5, strokeWidth: 0 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 mt-4 pt-4 border-t border-slate-200 dark:border-slate-800/40">
        <div className="flex items-center gap-2">
          <div className="h-2.5 w-2.5 rounded-full bg-primary-600" />
          <span className="text-xs text-slate-600 dark:text-slate-400">Feedbacks</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-2.5 w-2.5 rounded-full bg-blue-400" />
          <span className="text-xs text-slate-600 dark:text-slate-400">Satisfaction</span>
        </div>
      </div>
    </div>
  );
}
