'use client';

import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { QrCode, TrendingUp } from 'lucide-react';

const data = [
  { day: 'Lun', scans: 1180 },
  { day: 'Mar', scans: 1420 },
  { day: 'Mer', scans: 1650 },
  { day: 'Jeu', scans: 1380 },
  { day: 'Ven', scans: 1890 },
  { day: 'Sam', scans: 2340 },
  { day: 'Dim', scans: 1820 },
];

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-xl border border-slate-200/80 dark:border-slate-700/60 bg-white/95 dark:bg-[#1a1a1a]/95 backdrop-blur-sm p-3 shadow-xl">
        <p className="text-xs font-semibold text-slate-900 dark:text-white mb-1.5">
          {payload[0].payload.day}
        </p>
        <div className="flex items-center gap-2">
          <QrCode className="h-3 w-3 text-primary-600 dark:text-primary-400" />
          <span className="text-xs text-slate-600 dark:text-slate-400">Scans</span>
          <span className="text-sm font-bold text-slate-900 dark:text-white tabular-nums">
            {payload[0].value.toLocaleString()}
          </span>
        </div>
      </div>
    );
  }
  return null;
};

export default function QrScanChart() {
  const totalScans = data.reduce((sum, item) => sum + item.scans, 0);
  const avgScans = Math.round(totalScans / data.length);
  const maxDay = data.reduce((prev, current) => (prev.scans > current.scans ? prev : current));

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800/60 bg-white dark:bg-[#111111] p-4 sm:p-6 shadow-sm">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-1">
            QR Codes scannés
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-400">
            Activité de la semaine dernière
          </p>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-50 dark:bg-primary-900/20">
          <QrCode className="h-5 w-5 text-primary-600 dark:text-primary-400" />
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="rounded-lg bg-slate-50 dark:bg-[#0f0f0f] p-3 border border-slate-200/50 dark:border-slate-800/40">
          <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">Total</p>
          <p className="text-lg font-bold text-slate-900 dark:text-white tabular-nums">
            {totalScans.toLocaleString()}
          </p>
        </div>
        <div className="rounded-lg bg-slate-50 dark:bg-[#0f0f0f] p-3 border border-slate-200/50 dark:border-slate-800/40">
          <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">Moyenne/jour</p>
          <p className="text-lg font-bold text-slate-900 dark:text-white tabular-nums">
            {avgScans.toLocaleString()}
          </p>
        </div>
        <div className="rounded-lg bg-primary-50 dark:bg-primary-900/20 p-3 border border-primary-100 dark:border-primary-800/40">
          <p className="text-xs text-primary-700 dark:text-primary-400 mb-1">Pic</p>
          <div className="flex items-center gap-1">
            <p className="text-lg font-bold text-primary-700 dark:text-primary-400 tabular-nums">
              {maxDay.scans.toLocaleString()}
            </p>
            <TrendingUp className="h-3 w-3 text-primary-600 dark:text-primary-400" />
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="h-[200px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="currentColor"
              className="text-slate-200 dark:text-slate-800/30"
              vertical={false}
            />
            <XAxis
              dataKey="day"
              stroke="currentColor"
              className="text-slate-400 dark:text-slate-500"
              tick={{ fontSize: 11 }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="currentColor"
              className="text-slate-400 dark:text-slate-500"
              tick={{ fontSize: 11 }}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="scans"
              stroke="#3a5a40"
              strokeWidth={3}
              dot={{ fill: '#3a5a40', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, strokeWidth: 0 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
