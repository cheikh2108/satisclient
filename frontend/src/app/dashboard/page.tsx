'use client';

import Stats4 from '@/components/ui/stats-4';
import ActivityChart from '@/components/ui/activity-chart';
import CategoryChart from '@/components/ui/category-chart';
import SitesChart from '@/components/ui/sites-chart';
import QrScanChart from '@/components/ui/qr-scan-chart';
import { Calendar, Filter, Download } from 'lucide-react';

export default function DashboardPage() {
  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-[34px] font-bold text-slate-900 dark:text-white leading-tight">
            Bienvenue, Cheikh
          </h1>
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <button className="flex items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-800/60 bg-white dark:bg-[#1a1a1a] px-3 sm:px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#222222] active:scale-95 transition-all">
            <Calendar className="h-4 w-4" />
            <span className="hidden xs:inline">Période</span>
          </button>
          <button className="flex items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-800/60 bg-white dark:bg-[#1a1a1a] px-3 sm:px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#222222] active:scale-95 transition-all">
            <Filter className="h-4 w-4" />
            <span className="hidden xs:inline">Filtrer</span>
          </button>
          <button className="flex items-center gap-2 rounded-xl bg-primary-600 px-3 sm:px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 active:scale-95 transition-all shadow-sm">
            <Download className="h-4 w-4" />
            <span className="hidden xs:inline">Exporter</span>
          </button>
        </div>
      </div>

      {/* KPI Cards - Stats4 avec mini graphiques */}
      <Stats4 />

      {/* Activity Chart - Vue d'ensemble principale */}
      <ActivityChart />

      {/* Grid 2 colonnes - Graphiques secondaires */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CategoryChart />
        <SitesChart />
      </div>

      {/* QR Scan Chart - Pleine largeur */}
      <QrScanChart />
    </div>
  );
}
