'use client';

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell } from 'recharts';
import { useSites, useSiteStats, useFeedbacks } from '@/hooks';

const COLORS = ['#3a5a40', '#3a5a40', '#588157', '#588157', '#a3b18a', '#dad7cd'];

export default function SitesChart() {
  const { data: sitesData } = useSites();
  const { data: siteStats } = useSiteStats();
  const { data: feedbacksData } = useFeedbacks({ take: 1000 } as any);

  const chartData = React.useMemo(() => {
    const sites = sitesData?.data || [];
    const feedbacks = (feedbacksData as any)?.data || [];

    return sites
      .map((site, i) => {
        const count = feedbacks.filter((f: any) => f.siteId === site.id).length;
        return { site: site.name, nps: count, color: COLORS[i % COLORS.length] };
      })
      .sort((a, b) => b.nps - a.nps)
      .slice(0, 6);
  }, [sitesData, feedbacksData]);

  const avgFeedbacks = chartData.length > 0
    ? Math.round(chartData.reduce((sum, s) => sum + s.nps, 0) / chartData.length)
    : 0;
  const bestSite = chartData[0]?.site ?? '—';
  const totalSites = siteStats?.total ?? 0;

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-xl border border-slate-200/80 dark:border-slate-700/60 bg-white/95 dark:bg-[#1a1a1a]/95 backdrop-blur-sm p-3 shadow-xl">
          <p className="text-sm font-semibold text-slate-900 dark:text-white mb-1">
            {payload[0].payload.site}
          </p>
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-600 dark:text-slate-400">Feedbacks</span>
            <span className="font-bold text-primary-600 dark:text-primary-400 tabular-nums">
              {payload[0].value}
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
          Performance par site
        </h3>
        <p className="text-xs text-slate-600 dark:text-slate-400">
          Feedbacks des 6 meilleurs établissements
        </p>
      </div>

      {/* Chart */}
      <div className="h-[220px] sm:h-[280px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData.length > 0 ? chartData : [{ site: '—', nps: 0, color: '#e0e0e0' }]}
            layout="vertical"
            margin={{ left: 10, right: 10 }}
          >
            <XAxis type="number" domain={[0, 'dataMax']} hide />
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
              {(chartData.length > 0 ? chartData : [{ site: '—', nps: 0, color: '#e0e0e0' }]).map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Footer Stats */}
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-200 dark:border-slate-800/40">
        <div>
          <p className="text-xs text-slate-600 dark:text-slate-400">Moy. feedbacks</p>
          <p className="text-lg font-bold text-primary-600 dark:text-primary-400 tabular-nums">
            {avgFeedbacks.toLocaleString()}
          </p>
        </div>
        <div>
          <p className="text-xs text-slate-600 dark:text-slate-400">Meilleur site</p>
          <p className="text-sm font-semibold text-slate-900 dark:text-white">
            {bestSite}
          </p>
        </div>
        <div>
          <p className="text-xs text-slate-600 dark:text-slate-400">Total sites</p>
          <p className="text-lg font-bold text-slate-900 dark:text-white tabular-nums">
            {totalSites.toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
}
