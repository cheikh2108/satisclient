"use client";

import dynamic from "next/dynamic";
import {
  useCurrentUser,
  usePlatformCampaignStats,
  usePlatformStats,
} from "@/hooks";
import {
  Building2,
  Users,
  MapPin,
  Activity,
  Coins,
  CreditCard,
} from "lucide-react";
import Link from "next/link";

const Stats4 = dynamic(() => import("@/components/ui/stats-4"), {
  loading: () => (
    <div className="h-48 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800" />
  ),
  ssr: false,
});
const ActivityChart = dynamic(() => import("@/components/ui/activity-chart"), {
  loading: () => (
    <div className="h-64 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800" />
  ),
  ssr: false,
});
const CategoryChart = dynamic(() => import("@/components/ui/category-chart"), {
  loading: () => (
    <div className="h-64 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800" />
  ),
  ssr: false,
});
const SitesChart = dynamic(() => import("@/components/ui/sites-chart"), {
  loading: () => (
    <div className="h-64 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800" />
  ),
  ssr: false,
});
const QrScanChart = dynamic(() => import("@/components/ui/qr-scan-chart"), {
  loading: () => (
    <div className="h-64 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800" />
  ),
  ssr: false,
});

// ─── Dashboard Plateforme (super_admin) ───────────────────────────────────────

function PlatformDashboard({ firstName }: { firstName: string }) {
  const { data: platform } = usePlatformStats();
  const { data: campaign } = usePlatformCampaignStats();

  const kpis = [
    {
      label: "Organisations",
      value: platform?.organizations.total ?? 0,
      sub: `${platform?.organizations.active ?? 0} actives · ${platform?.organizations.trial ?? 0} en essai`,
      icon: Building2,
      href: "/dashboard/organizations",
      color: "text-blue-600 dark:text-blue-400",
      bg: "bg-blue-50 dark:bg-blue-900/20",
    },
    {
      label: "Utilisateurs",
      value: platform?.users.total ?? 0,
      sub: `${platform?.users.active ?? 0} actifs · ${platform?.users.pending ?? 0} en attente`,
      icon: Users,
      href: "/dashboard/users",
      color: "text-primary-600 dark:text-primary-400",
      bg: "bg-primary-50 dark:bg-primary-900/20",
    },
    {
      label: "Établissements",
      value: platform?.sites.total ?? 0,
      sub: `${platform?.sites.active ?? 0} actifs`,
      icon: MapPin,
      href: "/dashboard/sites",
      color: "text-purple-600 dark:text-purple-400",
      bg: "bg-purple-50 dark:bg-purple-900/20",
    },
    {
      label: "Activité globale",
      value:
        (platform?.activity.totalFeedbacks ?? 0) +
        (platform?.activity.totalComplaints ?? 0),
      sub: `${platform?.activity.totalFeedbacks ?? 0} feedbacks · ${platform?.activity.totalComplaints ?? 0} réclamations`,
      icon: Activity,
      href: "/dashboard/feedbacks",
      color: "text-amber-600 dark:text-amber-400",
      bg: "bg-amber-50 dark:bg-amber-900/20",
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
              <p className="text-2xl font-bold text-slate-900 dark:text-white">
                {kpi.value}
              </p>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                {kpi.sub}
              </p>
            </Link>
          ))}
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Campagnes et revenus
          </p>
          <span className="text-xs text-slate-400 dark:text-slate-500">
            Paiements confirmés
          </span>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              label: "Chiffre d’affaires",
              value: `${(campaign?.overview.revenue ?? 0).toLocaleString("fr-FR")} XOF`,
              sub: `${campaign?.overview.successfulPayments ?? 0} paiements réussis`,
              icon: CreditCard,
            },
            {
              label: "Crédits vendus",
              value: campaign?.overview.purchasedCredits ?? 0,
              sub: `${campaign?.overview.packsSold ?? 0} packs · ${campaign?.overview.consumedCredits ?? 0} consommés`,
              icon: Coins,
            },
            {
              label: "Crédits disponibles",
              value: campaign?.overview.remainingCredits ?? 0,
              sub: `${campaign?.overview.activePacks ?? 0} packs actifs`,
              icon: Activity,
            },
            {
              label: "Packs à surveiller",
              value: campaign?.overview.expiringPacks ?? 0,
              sub: "Expiration dans les 30 jours",
              icon: MapPin,
            },
          ].map((kpi) => (
            <div
              key={kpi.label}
              className="rounded-xl border border-slate-200 dark:border-slate-800/60 bg-white dark:bg-[#111111] p-5"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-900/20">
                  <kpi.icon className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                </div>
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                  {kpi.label}
                </p>
              </div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">
                {kpi.value}
              </p>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                {kpi.sub}
              </p>
            </div>
          ))}
        </div>
        <div className="mt-4 rounded-xl border border-slate-200 dark:border-slate-800/60 bg-white dark:bg-[#111111] overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800/60">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
              Activité par organisation
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 dark:bg-slate-900/50 text-xs text-slate-500 dark:text-slate-400">
                <tr>
                  <th className="text-left font-medium px-5 py-3">
                    Organisation
                  </th>
                  <th className="text-right font-medium px-5 py-3">Packs</th>
                  <th className="text-right font-medium px-5 py-3">Crédits</th>
                  <th className="text-right font-medium px-5 py-3">Restants</th>
                  <th className="text-right font-medium px-5 py-3">Sondages</th>
                </tr>
              </thead>
              <tbody>
                {(campaign?.byOrganization ?? []).map((organization) => (
                  <tr
                    key={organization.id}
                    className="border-t border-slate-100 dark:border-slate-800/60"
                  >
                    <td className="px-5 py-3 font-medium text-slate-700 dark:text-slate-200">
                      {organization.name}
                    </td>
                    <td className="px-5 py-3 text-right text-slate-500 dark:text-slate-400">
                      {organization.packs}
                    </td>
                    <td className="px-5 py-3 text-right text-slate-500 dark:text-slate-400">
                      {organization.purchased}
                    </td>
                    <td className="px-5 py-3 text-right text-emerald-600 dark:text-emerald-400">
                      {organization.remaining}
                    </td>
                    <td className="px-5 py-3 text-right text-slate-500 dark:text-slate-400">
                      {organization.surveys}
                    </td>
                  </tr>
                ))}
                {!campaign?.byOrganization.length && (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-5 py-6 text-center text-slate-400"
                    >
                      Aucune vente de pack confirmée
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
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
  const firstName = currentUser?.firstName || "Admin";

  if (role === "super_admin") {
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
