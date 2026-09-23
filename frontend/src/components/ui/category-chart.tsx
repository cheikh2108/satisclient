'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const data = [
  { name: 'Service', value: 35, color: '#3a5a40' },
  { name: 'Produit', value: 28, color: '#588157' },
  { name: 'Livraison', value: 18, color: '#a3b18a' },
  { name: 'Accueil', value: 12, color: '#dad7cd' },
  { name: 'Autre', value: 7, color: '#e0e0e0' },
];

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-xl border border-slate-200/80 dark:border-slate-700/60 bg-white/95 dark:bg-[#1a1a1a]/95 backdrop-blur-sm p-3 shadow-xl">
        <p className="text-sm font-semibold text-slate-900 dark:text-white mb-1">
          {payload[0].name}
        </p>
        <div className="flex items-center gap-2 text-xs">
          <div
            className="h-2 w-2 rounded-full"
            style={{ backgroundColor: payload[0].payload.color }}
          />
          <span className="text-slate-600 dark:text-slate-400">
            {payload[0].value} réclamations ({((payload[0].value / 100) * 100).toFixed(0)}%)
          </span>
        </div>
      </div>
    );
  }
  return null;
};

export default function CategoryChart() {
  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800/60 bg-white dark:bg-[#111111] p-4 sm:p-6 shadow-sm">
      {/* Header */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-1">
          Réclamations par catégorie
        </h3>
        <p className="text-xs text-slate-600 dark:text-slate-400">
          Répartition des 100 dernières réclamations
        </p>
      </div>

      {/* Chart */}
      <div className="h-[280px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={90}
              paddingAngle={2}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Legend Custom */}
      <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-slate-200 dark:border-slate-800/40">
        {data.map((item) => (
          <div key={item.name} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-xs text-slate-600 dark:text-slate-400">
                {item.name}
              </span>
            </div>
            <span className="text-xs font-semibold text-slate-900 dark:text-white tabular-nums">
              {item.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
