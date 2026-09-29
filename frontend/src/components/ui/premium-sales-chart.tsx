'use client';

import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Info, MoreHorizontal } from 'lucide-react';

// Generate dense data (multiple days per month) - STATIC pour éviter hydratation error
const generateMonthData = (month: string, baseNew: number, baseExisting: number, seed: number) => {
  const days = [];
  for (let i = 0; i < 30; i++) {
    // Use seed for deterministic values
    const variation = ((seed + i * 13) % 100) / 100;
    days.push({
      day: `${month}-${i + 1}`,
      month,
      newUser: Math.floor(baseNew + variation * baseNew * 0.3),
      existingUser: Math.floor(baseExisting + variation * baseExisting * 0.3),
    });
  }
  return days;
};

const data = {
  monthly: [
    ...generateMonthData('JAN', 10, 20, 1),
    ...generateMonthData('FEB', 12, 22, 2),
    ...generateMonthData('MAR', 15, 25, 3),
    ...generateMonthData('APR', 18, 28, 4),
    ...generateMonthData('MAY', 20, 35, 5),
    ...generateMonthData('JUN', 25, 38, 6),
    ...generateMonthData('JUL', 22, 32, 7),
    ...generateMonthData('AUG', 20, 30, 8),
    ...generateMonthData('SEP', 23, 33, 9),
    ...generateMonthData('OCT', 26, 38, 10),
    ...generateMonthData('NOV', 24, 35, 11),
    ...generateMonthData('DEC', 28, 40, 12),
  ],
};

type Period = 'monthly';

export default function PremiumSalesChart() {
  const [period] = useState<Period>('monthly');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const chartData = data[period];

  // Calculate totals
  const totalRevenue = chartData.reduce(
    (sum: number, item: { newUser: number; existingUser: number }) => sum + item.newUser + item.existingUser,
    0
  );

  // Format number consistently (client-side only)
  const formattedRevenue = mounted
    ? `$${(totalRevenue * 10).toLocaleString('en-US')}`
    : `$${(totalRevenue * 10)}`;

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="rounded-xl border border-slate-200/80 dark:border-slate-700/60 bg-white/95 dark:bg-[#1a1a1a]/95 backdrop-blur-sm p-3.5 shadow-xl dark:shadow-2xl">
          <p className="mb-2.5 text-xs font-semibold text-slate-900 dark:text-white uppercase tracking-wide">
            {data.month} 2025
          </p>
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-slate-400 dark:bg-slate-500" />
                <span className="text-slate-600 dark:text-slate-400 text-xs">New User</span>
              </div>
              <span className="font-semibold text-slate-900 dark:text-white tabular-nums">
                {(payload[0].value / 1000).toFixed(1)}k
              </span>
            </div>
            <div className="flex items-center justify-between gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-slate-900 dark:bg-slate-300" />
                <span className="text-slate-600 dark:text-slate-400 text-xs">Existing User</span>
              </div>
              <span className="font-semibold text-slate-900 dark:text-white tabular-nums">
                {(payload[1].value / 1000).toFixed(1)}k
              </span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="rounded-[14px] border border-[#EAEAEA] dark:border-slate-800/60 bg-white dark:bg-[#111111] p-4 sm:p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <div className="flex items-center gap-2">
          <h3 className="text-xs sm:text-sm font-semibold uppercase tracking-[0.05em] text-slate-500 dark:text-slate-400">
            Sales Trend
          </h3>
          <Info className="h-3.5 sm:h-4 w-3.5 sm:w-4 text-slate-400" />
        </div>
        <button className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-[#1a1a1a] active:scale-95 transition-all">
          <MoreHorizontal className="h-5 w-5 text-slate-400 dark:text-slate-500" />
        </button>
      </div>

      {/* Stats + Legend + Period Selector */}
      <div className="flex flex-col gap-4 mb-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-6">
          <div>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">Total Revenue:</p>
            <p className="text-xl sm:text-2xl font-semibold text-slate-900 dark:text-white">
              {formattedRevenue}
            </p>
          </div>
          <div className="flex items-center gap-3 sm:gap-4 text-xs sm:text-sm">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-slate-400" />
              <span className="text-slate-600 dark:text-slate-400">NEW USER</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-slate-900 dark:bg-slate-400" />
              <span className="text-slate-600 dark:text-slate-400">EXISTING USER</span>
            </div>
          </div>
        </div>

        <div className="rounded-lg bg-slate-100 dark:bg-[#0f0f0f] px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-400 border border-transparent dark:border-slate-800/40">
          Mensuel
        </div>
      </div>

      {/* Chart */}
      <div className="h-[280px] sm:h-[340px] lg:h-[380px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} barGap={0} barCategoryGap={0}>
            <CartesianGrid
              strokeDasharray="0"
              stroke="currentColor"
              className="text-slate-200 dark:text-slate-800/30"
              vertical={true}
              horizontal={true}
            />
            <XAxis
              dataKey="month"
              stroke="currentColor"
              className="text-slate-400 dark:text-slate-500"
              tick={{ fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              interval={29}
            />
            <YAxis
              stroke="currentColor"
              className="text-slate-400 dark:text-slate-500"
              tick={{ fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `${value}k`}
              ticks={[0, 10, 20, 30, 40, 50, 60]}
            />
            <Tooltip content={<CustomTooltip />} cursor={false} />
            <Bar
              dataKey="newUser"
              fill="currentColor"
              className="text-slate-400 dark:text-slate-500"
              radius={[2, 2, 0, 0]}
              maxBarSize={2}
            />
            <Bar
              dataKey="existingUser"
              fill="currentColor"
              className="text-slate-900 dark:text-slate-300"
              radius={[2, 2, 0, 0]}
              maxBarSize={2}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
