'use client';

import React, { useState } from 'react';
import {
  useFeedbackStats,
  useQRCodeStats,
  useSites,
  useCurrentUser,
  useGenerateComplaintsReport,
  useGenerateSurveyReport,
  useGenerateAnalyticsReport,
  useGenerateFeedbacksReport,
  useGenerateUsersReport,
  useGenerateSitesReport,
} from '@/hooks';
import { useQuery } from '@tanstack/react-query';
import { reclamationsApi } from '@/lib/api/reclamations';
import { sitesApi } from '@/lib/api/sites';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { DateRangePicker } from '@/components/ui/datepicker';
import { useToast } from '@/components/ui/toast';
import { BarChart3, Download, FileText, TrendingUp, PieChart, Users, Calendar } from 'lucide-react';

interface Report {
  id: string;
  name: string;
  type: 'FEEDBACK' | 'COMPLAINT' | 'SITE' | 'USER' | 'CUSTOM';
  description: string;
  format: string;
  icon: any;
  color: string;
}

const availableReports: Report[] = [
  {
    id: '1',
    name: 'Rapport Feedbacks',
    type: 'FEEDBACK',
    description: 'Analyse complète des retours clients sur la période sélectionnée',
    format: 'PDF',
    icon: BarChart3,
    color: 'primary',
  },
  {
    id: '2',
    name: 'Rapport Réclamations',
    type: 'COMPLAINT',
    description: 'Suivi détaillé des réclamations et leur résolution',
    format: 'EXCEL',
    icon: FileText,
    color: 'red',
  },
  {
    id: '3',
    name: 'Performance Sites',
    type: 'SITE',
    description: 'Comparatif de performance entre tous les sites',
    format: 'PDF',
    icon: TrendingUp,
    color: 'blue',
  },
  {
    id: '4',
    name: 'Rapport Utilisateurs',
    type: 'USER',
    description: 'Activité et statistiques des utilisateurs',
    format: 'CSV',
    icon: Users,
    color: 'purple',
  },
  {
    id: '5',
    name: 'Rapport NPS',
    type: 'CUSTOM',
    description: 'Évolution du Net Promoter Score',
    format: 'PDF',
    icon: PieChart,
    color: 'green',
  },
  {
    id: '6',
    name: 'Rapport Mensuel',
    type: 'CUSTOM',
    description: 'Synthèse mensuelle complète de l\'activité',
    format: 'PDF',
    icon: Calendar,
    color: 'amber',
  },
];

const StatCard = ({ label, value, change, isPositive = true }: { label: string; value: string; change: string; isPositive?: boolean }) => (
  <div className="rounded-xl bg-slate-50/50 dark:bg-[#0a0a0a]/50 border border-slate-200/50 dark:border-slate-800/50 p-6">
    <div className="flex items-start justify-between">
      <div className="flex-1">
        <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">
          {label}
        </p>
        <p className="text-3xl font-bold text-slate-900 dark:text-white">
          {value}
        </p>
      </div>
      <span className={`text-sm font-semibold ${isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
        {change}
      </span>
    </div>
  </div>
);

export default function ReportsPage() {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedSite, setSelectedSite] = useState('');
  const [formats, setFormats] = useState<Record<string, string>>({});
  const { addToast } = useToast();
  const { data: currentUser } = useCurrentUser();
  const generateComplaints = useGenerateComplaintsReport();
  const generateSurvey = useGenerateSurveyReport();
  const generateAnalytics = useGenerateAnalyticsReport();
  const generateFeedbacks = useGenerateFeedbacksReport();
  const generateUsers = useGenerateUsersReport();
  const generateSites = useGenerateSitesReport();

  const { data: feedbackStats } = useFeedbackStats();
  const { data: sitesData } = useSites();
  const { data: rclStats } = useQuery({
    queryKey: ['reclamations', 'stats', '30d'],
    queryFn: () => reclamationsApi.getStats('30d'),
  });
  const { data: qrStats } = useQRCodeStats();
  const { data: siteStats } = useQuery({
    queryKey: ['sites', 'stats'],
    queryFn: () => sitesApi.getStats(),
  });

  const [recentReports, setRecentReports] = React.useState<{ name: string; format: string; date: string }[]>([]);

  const handleGenerateReport = (report: Report) => {
    const fmt = ((formats[report.id] || report.format).toLowerCase()) as 'pdf' | 'excel' | 'csv';
    const params = {
      organizationId: (currentUser as any)?.organizationId,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      format: fmt,
    };

    let mutation: typeof generateComplaints;
    switch (report.type) {
      case 'COMPLAINT': mutation = generateComplaints; break;
      case 'FEEDBACK': mutation = generateFeedbacks; break;
      case 'USER': mutation = generateUsers; break;
      case 'SITE': mutation = generateSites; break;
      default: mutation = generateAnalytics; break;
    }

    mutation.mutate(params, {
      onSuccess: () => {
        setRecentReports(prev => [
          { name: report.name, format: fmt.toUpperCase(), date: new Date().toLocaleDateString('fr-FR') },
          ...prev.slice(0, 9),
        ]);
      },
    });
  };

  const isAnyPending = generateComplaints.isPending || generateSurvey.isPending || generateAnalytics.isPending
    || generateFeedbacks.isPending || generateUsers.isPending || generateSites.isPending;

  const getColorClass = (color: string) => {
    const colors: Record<string, string> = {
      primary: 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400',
      red: 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400',
      blue: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400',
      purple: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400',
      green: 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400',
      amber: 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400',
    };
    return colors[color] || colors.primary;
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-[34px] font-bold text-slate-900 dark:text-white leading-tight">
            Rapports
          </h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Générez et exportez vos rapports analytiques
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Feedbacks (30j)" value={(feedbackStats?.total ?? 0).toString()} change={(feedbackStats?.total??0)>0 ? `${Math.round(((feedbackStats as any)?.bySentiment?.positive??0)/(feedbackStats?.total??1)*100)}%` : '—'} isPositive />
        <StatCard label="Réclamations (30j)" value={(rclStats?.total ?? 0).toString()} change={(rclStats?.total??0)>0 ? `${Math.round(((rclStats?.byStatus?.resolved??0)+(rclStats?.byStatus?.closed??0))/(rclStats?.total??1)*100)}%` : '—'} isPositive />
        <StatCard label="Scans QR (total)" value={(qrStats?.totalScans ?? 0).toLocaleString('fr-FR')} change={(qrStats?.totalQrCodes??0)>0 ? `${Math.round(((qrStats?.activeQrCodes??0)/Math.max(qrStats?.totalQrCodes??1,1))*100)}%` : '—'} isPositive />
        <StatCard label="Sites actifs" value={(siteStats?.active ?? 0).toString()} change={(siteStats?.total??0)>0 ? `${Math.round(((siteStats?.active??0)/Math.max(siteStats?.total??1,1))*100)}%` : '—'} isPositive />
      </div>

      {/* Filters — période et site uniquement */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800/60 bg-white dark:bg-[#111111] p-6">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
          Paramètres de génération
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <DateRangePicker
            label="Période"
            startDate={startDate}
            endDate={endDate}
            onStartDateChange={setStartDate}
            onEndDateChange={setEndDate}
          />
          <Select
            label="Site"
            options={[
              { value: '', label: 'Tous les sites' },
              ...(sitesData?.data || []).map((s) => ({ value: s.id, label: s.name })),
            ]}
            value={selectedSite}
            onChange={setSelectedSite}
          />
          <div className="flex items-end">
            <Button variant="primary" className="w-full" onClick={() => addToast({ type: 'info', title: 'Paramètres de période appliqués' })}>
              <Download className="h-4 w-4 mr-2" />
              Appliquer
            </Button>
          </div>
        </div>
      </div>

      {/* Available Reports */}
      <div>
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
          Rapports disponibles
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {availableReports.map((report) => {
            const Icon = report.icon;
            return (
              <div
                key={report.id}
                className="rounded-xl border border-slate-200 dark:border-slate-800/60 bg-white dark:bg-[#111111] p-6 hover:shadow-lg hover:border-slate-300 dark:hover:border-slate-700/80 transition-all"
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className={`h-12 w-12 rounded-xl flex items-center justify-center flex-shrink-0 ${getColorClass(report.color)}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-1">
                      {report.name}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                      {formats[report.id] || report.format}
                    </p>
                  </div>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                  {report.description}
                </p>
                {/* Sélecteur de format par carte */}
                <div className="mt-3 mb-2">
                  <select
                    className="w-full text-xs border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1.5 bg-white dark:bg-[#1a1a1a] text-slate-700 dark:text-slate-300 cursor-pointer"
                    value={formats[report.id] || report.format}
                    onChange={(e) => setFormats(prev => ({ ...prev, [report.id]: e.target.value }))}
                  >
                    <option value="PDF">PDF</option>
                    <option value="EXCEL">Excel (.xlsx)</option>
                    <option value="CSV">CSV</option>
                  </select>
                </div>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => handleGenerateReport(report)}
                  disabled={isAnyPending}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Générer
                </Button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Reports */}
      <div>
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
          Rapports récents
        </h2>
        {recentReports.length === 0 ? (
          <div className="rounded-xl border border-slate-200 dark:border-slate-800/60 bg-white dark:bg-[#111111] p-8 text-center">
            <FileText className="h-10 w-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Aucun rapport généré</p>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Utilisez les boutons ci-dessus pour générer un rapport</p>
          </div>
        ) : (
          <div className="rounded-xl border border-slate-200 dark:border-slate-800/60 bg-white dark:bg-[#111111] divide-y divide-slate-200 dark:divide-slate-800/40 overflow-hidden">
            {recentReports.map((r, i) => (
              <div key={i} className="flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-[#0f0f0f] transition-colors">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-lg bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center flex-shrink-0">
                    <FileText className="h-4 w-4 text-primary-600 dark:text-primary-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900 dark:text-white">{r.name}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{r.date} • {r.format}</p>
                  </div>
                </div>
                <span className="text-xs bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 px-2 py-0.5 rounded font-medium">
                  Téléchargé
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
