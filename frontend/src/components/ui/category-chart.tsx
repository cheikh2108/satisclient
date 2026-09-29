'use client';

import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { useQuery } from '@tanstack/react-query';
import { reclamationsApi } from '@/lib/api/reclamations';

const COLORS = ['#3a5a40', '#588157', '#a3b18a', '#dad7cd', '#e0e0e0'];

export default function CategoryChart() {
  const { data: reclamationsData } = useQuery({
    queryKey: ['reclamations', 'category-chart'],
    queryFn: () => reclamationsApi.getAll({ take: 100 } as any),
  });

  const { chartData, total } = React.useMemo(() => {
    const items = reclamationsData?.data || [];
    const categoryMap = new Map<string, number>();
    items.forEach(r => {
      const cat = r.category || 'Autre';
      categoryMap.set(cat, (categoryMap.get(cat) || 0) + 1);
    });

    const sorted = Array.from(categoryMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    const data = sorted.map(([name, value], i) => ({
      name,
      value,
      color: COLORS[i % COLORS.length],
    }));

    const totalCount = data.reduce((sum, d) => sum + d.value, 0);
    return { chartData: data, total: totalCount };
  }, [reclamationsData]);

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
              {payload[0].value} réclamations ({total > 0 ? ((payload[0].value / total) * 100).toFixed(0) : 0}%)
            </span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800/60 bg-white dark:bg-[#111111] p-4 sm:p-6 shadow-sm">
      {/* Header */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-1">
          Réclamations par catégorie
        </h3>
        <p className="text-xs text-slate-600 dark:text-slate-400">
          Répartition des {total || 100} dernières réclamations
        </p>
      </div>

      {/* Chart */}
      <div className="h-[280px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData.length > 0 ? chartData : [{ name: '-', value: 1, color: '#e0e0e0' }]}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={90}
              paddingAngle={2}
              dataKey="value"
            >
              {(chartData.length > 0 ? chartData : [{ name: '-', value: 1, color: '#e0e0e0' }]).map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Legend Custom */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4 pt-4 border-t border-slate-200 dark:border-slate-800/40">
        {chartData.map((item) => (
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
