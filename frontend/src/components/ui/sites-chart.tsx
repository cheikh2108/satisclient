'use client';

import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell } from 'recharts';

const data = [
  { site: 'Paris Centre', nps: 85, color: '#3a5a40' },
  { site: 'Lyon Part-Dieu', nps: 82, color: '#3a5a40' },
  { site: 'Marseille Vieux-Port', nps: 78, color: '#588157' },
  { site: 'Toulouse Capitole', nps: 75, color: '#588157' },
  { site: 'Bordeaux Centre', nps: 72, color: '#a3b18a' },
  { site: 'Nice Promenade', nps: 68, color: '#dad7cd' },
];

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-xl border border-slate-200/80 dark:border-slate-700/60 bg-white/95 dark:bg-[#1a1a1a]/95 backdrop-blur-sm p-3 shadow-xl">
        <p className="text-sm font-semibold text-slate-900 dark:text-white mb-1">
          {payload[0].payload.site}
        </p>
        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-600 dark:text-slate-400">NPS Score</span>
          <span className="font-bold text-primary-600 dark:text-primary-400 tabular-nums">
            {payload[0].value}
          </span>
        </div>
      </div>
    );
  }
  return null;
};

export default function SitesChart() {
  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800/60 bg-white dark:bg-[#111111] p-4 sm:p-6 shadow-sm">
      {/* Header */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-1">
          Performance par site
        </h3>
        <p className="text-xs text-slate-600 dark:text-slate-400">
          Score NPS des 6 meilleurs établissements
        </p>
      </div>

      {/* Chart */}
      <div className="h-[280px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ left: 10, right: 10 }}>
            <XAxis type="number" domain={[0, 100]} hide />
            <YAxis
              type="category"
              dataKey="site"
              stroke="currentColor"
              className="text-slate-600 dark:text-slate-400"
              tick={{ fontSize: 12 }}
              tickLine={false}
              axisLine={false}
              width={120}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(148, 163, 184, 0.1)' }} />
            <Bar dataKey="nps" radius={[0, 6, 6, 0]} barSize={28}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Footer Stats */}
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-200 dark:border-slate-800/40">
        <div>
          <p className="text-xs text-slate-600 dark:text-slate-400">NPS Moyen</p>
          <p className="text-lg font-bold text-primary-600 dark:text-primary-400 tabular-nums">
            76.7
          </p>
        </div>
        <div>
          <p className="text-xs text-slate-600 dark:text-slate-400">Meilleur site</p>
          <p className="text-sm font-semibold text-slate-900 dark:text-white">
            Paris Centre
          </p>
        </div>
        <div>
          <p className="text-xs text-slate-600 dark:text-slate-400">Total sites</p>
          <p className="text-lg font-bold text-slate-900 dark:text-white tabular-nums">
            47
          </p>
        </div>
      </div>
    </div>
  );
}
