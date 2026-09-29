'use client';

import dynamic from 'next/dynamic';
import { useCurrentUser, usePlatformStats } from '@/hooks';
import { Building2, Users, MapPin, Activity } from 'lucide-react';
import Link from 'next/link';

const Stats4 = dynamic(() => import('@/components/ui/stats-4'), {
  loading: () => <div className="h-48 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800" />,
  ssr: false,
});
const ActivityChart = dynamic(() => import('@/components/ui/activity-chart'), {
  loading: () => <div className="h-64 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800" />,
  ssr: false,
});
const CategoryChart = dynamic(() => import('@/components/ui/category-chart'), {
  loading: () => <div className="h-64 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800" />,
  ssr: false,
});
const SitesChart = dynamic(() => import('@/components/ui/sites-chart'), {
  loading: () => <div className="h-64 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800" />,
  ssr: false,
});
const QrScanChart = dynamic(() => import('@/components/ui/qr-scan-chart'), {
  loading: () => <div className="h-64 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800" />,
  ssr: false,
});

// ─── Dashboard Plateforme (super_admin) ───────────────────────────────────────

function PlatformDashboard({ firstName }: { firstName: string }) {
  const { data: platform } = usePlatformStats();

  const kpis = [
    {
      label: 'Organisations',
      value: platform?.organizations.total ?? 0,
      sub: `${platform?.organizations.active ?? 0} actives · ${platform?.organizations.trial ?? 0} en essai`,
      icon: Building2,
      href: '/dashboard/organizations',
      color: 'text-blue-600 dark:text-blue-400',
      bg: 'bg-blue-50 dark:bg-blue-900/20',
    },
    {
      label: 'Utilisateurs',
      value: platform?.users.total ?? 0,
      sub: `${platform?.users.active ?? 0} actifs · ${platform?.users.pending ?? 0} en attente`,
      icon: Users,
      href: '/dashboard/users',
      color: 'text-primary-600 dark:text-primary-400',
      bg: 'bg-primary-50 dark:bg-primary-900/20',
    },
    {
      label: 'Sites',
      value: platform?.sites.total ?? 0,
      sub: `${platform?.sites.active ?? 0} actifs`,
      icon: MapPin,
      href: '/dashboard/sites',
      color: 'text-purple-600 dark:text-purple-400',
      bg: 'bg-purple-50 dark:bg-purple-900/20',
    },
    {
      label: 'Activité globale',
      value: (platform?.activity.totalFeedbacks ?? 0) + (platform?.activity.totalComplaints ?? 0),
      sub: `${platform?.activity.totalFeedbacks ?? 0} feedbacks · ${platform?.activity.totalComplaints ?? 0} réclamations`,
      icon: Activity,
      href: '/dashboard/feedbacks',
      color: 'text-amber-600 dark:text-amber-400',
      bg: 'bg-amber-50 dark:bg-amber-900/20',
    },
  ];

  return (
    <div className="space-y-6 sm:space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
          Plateforme SatisClient
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Bienvenue, {firstName} — vue administrateur plateforme
        </p>
      </div>

      {/* 1. KPIs satisfaction (feedbacks, NPS, réclamations) */}
      <Stats4 />

      {/* 2. KPIs plateforme */}
      <div>
        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
          Administration plateforme
        </p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {kpis.map((kpi) => (
            <Link
              key={kpi.label}
              href={kpi.href}
              className="rounded-xl border border-slate-200 dark:border-slate-800/60 bg-white dark:bg-[#111111] p-5 hover:border-slate-300 dark:hover:border-slate-700 transition-colors group"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className={`p-2 rounded-lg ${kpi.bg}`}>
                  <kpi.icon className={`h-4 w-4 ${kpi.color}`} />
                </div>
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                  {kpi.label}
                </p>
              </div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{kpi.value}</p>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">{kpi.sub}</p>
            </Link>
          ))}
        </div>
      </div>

      {/* 3. Graphiques d'activité */}
      <ActivityChart />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CategoryChart />
        <SitesChart />
      </div>
      <QrScanChart />
    </div>
  );
}

// ─── Dashboard Client (tous les autres rôles) ─────────────────────────────────

export default function DashboardPage() {
  const { data: currentUser } = useCurrentUser();
  const role = (currentUser as any)?.role as string | undefined;
  const firstName = currentUser?.firstName || 'Admin';

  if (role === 'super_admin') {
    return <PlatformDashboard firstName={firstName} />;
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-[34px] font-bold text-slate-900 dark:text-white leading-tight">
            Bienvenue, {firstName}
          </h1>
        </div>
      </div>
      <Stats4 />
      <ActivityChart />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CategoryChart />
        <SitesChart />
      </div>
      <QrScanChart />
    </div>
  );
}
