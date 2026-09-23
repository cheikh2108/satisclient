'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { KPICard } from '@/components/ui/kpi-card';
import { Badge, StatusBadge, SentimentBadge } from '@/components/ui/badge';
import ProgressMetricCard from '@/components/ui/progress-metric-card';
import Stats4 from '@/components/ui/stats-4';
import {
  HomeIcon,
  UsersIcon,
  TrendingUpIcon,
  MessageSquareIcon,
  AlertCircleIcon
} from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="mx-auto max-w-3xl text-center">
          <Badge variant="primary" className="mb-4">
            Design System Preview
          </Badge>
          <h1 className="mb-4 text-5xl font-bold text-slate-900 dark:text-white">
            SatisClient
          </h1>
          <p className="mb-8 text-xl text-slate-600 dark:text-slate-400">
            Plateforme de satisfaction client avec{' '}
            <span className="font-semibold text-primary-600 dark:text-primary-400">#3a5a40</span>
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link href="/dashboard">
              <Button variant="primary" size="lg">
                Voir le Dashboard
              </Button>
            </Link>
            <Button variant="outline" size="lg">
              Documentation
            </Button>
          </div>
        </div>
      </div>

      {/* Progress Metric Cards (Responsive) */}
      <div className="container mx-auto px-4 pb-16">
        <h2 className="mb-6 text-2xl font-semibold text-slate-900 dark:text-white">
          Progress Metric Cards (Responsive)
        </h2>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <ProgressMetricCard
            title="Total Feedbacks"
            unit="feedbacks"
            accent="forest"
            data={[
              { value: 100, date: '18 Mar' },
              { value: 115, date: '21 Mar' },
              { value: 120, date: '24 Mar' },
              { value: 110, date: '27 Mar' },
              { value: 178, date: '30 Mar' },
              { value: 180, date: '02 Apr' },
              { value: 205, date: '05 Apr' },
              { value: 185, date: '08 Apr' },
              { value: 180, date: '11 Apr' },
              { value: 183, date: '14 Apr' },
              { value: 185, date: '17 Apr' },
              { value: 185, date: '20 Apr' },
              { value: 166, date: '23 Apr' },
              { value: 181, date: '26 Apr' },
              { value: 168, date: '29 Apr' },
              { value: 195, date: '02 May' },
              { value: 188, date: '05 May' },
              { value: 162, date: '08 May' },
              { value: 166, date: '11 May' },
            ]}
            defaultIndex={6}
            size="md"
          />

          <ProgressMetricCard
            title="NPS Score"
            unit="points"
            accent="forest"
            data={[
              { value: 64, date: '18 Mar' },
              { value: 66, date: '21 Mar' },
              { value: 68, date: '24 Mar' },
              { value: 67, date: '27 Mar' },
              { value: 70, date: '30 Mar' },
              { value: 71, date: '02 Apr' },
              { value: 73, date: '05 Apr' },
              { value: 72, date: '08 Apr' },
              { value: 74, date: '11 Apr' },
              { value: 75, date: '14 Apr' },
              { value: 73, date: '17 Apr' },
              { value: 76, date: '20 Apr' },
              { value: 74, date: '23 Apr' },
              { value: 77, date: '26 Apr' },
              { value: 75, date: '29 Apr' },
              { value: 78, date: '02 May' },
              { value: 76, date: '05 May' },
              { value: 79, date: '08 May' },
              { value: 80, date: '11 May' },
            ]}
            size="md"
          />

          <ProgressMetricCard
            title="Réclamations"
            unit="réclamations"
            accent="rose"
            trend="down"
            data={[
              { value: 45, date: '18 Mar' },
              { value: 42, date: '21 Mar' },
              { value: 38, date: '24 Mar' },
              { value: 40, date: '27 Mar' },
              { value: 35, date: '30 Mar' },
              { value: 32, date: '02 Apr' },
              { value: 30, date: '05 Apr' },
              { value: 28, date: '08 Apr' },
              { value: 26, date: '11 Apr' },
              { value: 24, date: '14 Apr' },
              { value: 23, date: '17 Apr' },
              { value: 21, date: '20 Apr' },
              { value: 22, date: '23 Apr' },
              { value: 20, date: '26 Apr' },
              { value: 19, date: '29 Apr' },
              { value: 18, date: '02 May' },
              { value: 17, date: '05 May' },
              { value: 16, date: '08 May' },
              { value: 15, date: '11 May' },
            ]}
            size="md"
          />

          <ProgressMetricCard
            title="Satisfaction Rate"
            unit="%"
            accent="emerald"
            data={[
              { value: 82, date: '18 Mar' },
              { value: 83, date: '21 Mar' },
              { value: 84, date: '24 Mar' },
              { value: 83, date: '27 Mar' },
              { value: 85, date: '30 Mar' },
              { value: 86, date: '02 Apr' },
              { value: 87, date: '05 Apr' },
              { value: 86, date: '08 Apr' },
              { value: 88, date: '11 Apr' },
              { value: 89, date: '14 Apr' },
              { value: 87, date: '17 Apr' },
              { value: 90, date: '20 Apr' },
              { value: 88, date: '23 Apr' },
              { value: 91, date: '26 Apr' },
              { value: 89, date: '29 Apr' },
              { value: 92, date: '02 May' },
              { value: 90, date: '05 May' },
              { value: 93, date: '08 May' },
              { value: 94, date: '11 May' },
            ]}
            size="md"
          />
        </div>
      </div>

      {/* Compact Stats Cards (Responsive) */}
      <div className="container mx-auto px-4 pb-16">
        <h2 className="mb-6 text-2xl font-semibold text-slate-900 dark:text-white">
          Compact Stats Cards (#3a5a40)
        </h2>
        <Stats4 />
      </div>

      {/* KPI Cards Grid */}
      <div className="container mx-auto px-4 pb-16">
        <h2 className="mb-6 text-2xl font-semibold text-slate-900 dark:text-white">
          KPI Cards (Asymmetric Layout)
        </h2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {/* Hero KPI - Spans 2 columns */}
          <KPICard
            title="Net Promoter Score"
            value={72}
            format="number"
            trend={{
              value: 8,
              isPositive: true,
              label: 'vs mois dernier',
            }}
            sentiment="positive"
            size="hero"
            icon={<TrendingUpIcon className="h-6 w-6" />}
            onClick={() => console.log('Clicked NPS')}
          />

          {/* Standard KPIs */}
          <KPICard
            title="CSAT Score"
            value={4.2}
            format="rating"
            trend={{
              value: 2.5,
              isPositive: true,
            }}
            sentiment="positive"
            icon={<MessageSquareIcon className="h-5 w-5" />}
          />

          <KPICard
            title="Total Feedbacks"
            value={1247}
            format="number"
            trend={{
              value: 12.3,
              isPositive: true,
              label: 'ce mois',
            }}
            icon={<UsersIcon className="h-5 w-5" />}
          />

          <KPICard
            title="Réclamations actives"
            value={23}
            format="number"
            trend={{
              value: 5.2,
              isPositive: false,
            }}
            sentiment="negative"
            icon={<AlertCircleIcon className="h-5 w-5" />}
          />

          <KPICard
            title="Taux de satisfaction"
            value={87.5}
            format="percent"
            trend={{
              value: 3.1,
              isPositive: true,
            }}
            sentiment="positive"
            icon={<HomeIcon className="h-5 w-5" />}
          />
        </div>
      </div>

      {/* Buttons Showcase */}
      <div className="container mx-auto px-4 pb-16">
        <h2 className="mb-6 text-2xl font-semibold text-slate-900 dark:text-white">
          Buttons (Press Feedback)
        </h2>
        <div className="flex flex-wrap items-center gap-4">
          <Button variant="primary">Primary Button</Button>
          <Button variant="secondary">Secondary Button</Button>
          <Button variant="accent">Accent Button</Button>
          <Button variant="outline">Outline Button</Button>
          <Button variant="ghost">Ghost Button</Button>
          <Button variant="danger">Danger Button</Button>
          <Button variant="primary" size="sm">Small</Button>
          <Button variant="primary" size="lg">Large</Button>
          <Button variant="primary" loading>Loading...</Button>
          <Button variant="primary" size="icon">
            <HomeIcon className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Badges Showcase */}
      <div className="container mx-auto px-4 pb-16">
        <h2 className="mb-6 text-2xl font-semibold text-slate-900 dark:text-white">
          Badges (FSM States)
        </h2>

        <div className="mb-6">
          <h3 className="mb-3 text-sm font-medium text-slate-600 dark:text-slate-400">
            Status Badges
          </h3>
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status="submitted" />
            <StatusBadge status="in_progress" />
            <StatusBadge status="reviewing" />
            <StatusBadge status="approved" />
            <StatusBadge status="rejected" />
            <StatusBadge status="resolved" />
            <StatusBadge status="closed" />
            <StatusBadge status="implemented" />
            <StatusBadge status="archived" />
          </div>
        </div>

        <div className="mb-6">
          <h3 className="mb-3 text-sm font-medium text-slate-600 dark:text-slate-400">
            Sentiment Badges
          </h3>
          <div className="flex flex-wrap items-center gap-2">
            <SentimentBadge sentiment="positive" />
            <SentimentBadge sentiment="neutral" />
            <SentimentBadge sentiment="negative" />
          </div>
        </div>

        <div>
          <h3 className="mb-3 text-sm font-medium text-slate-600 dark:text-slate-400">
            Generic Badges
          </h3>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="primary">Primary</Badge>
            <Badge variant="accent">Accent</Badge>
            <Badge variant="secondary">Secondary</Badge>
            <Badge variant="success">Success</Badge>
            <Badge variant="warning">Warning</Badge>
            <Badge variant="danger">Danger</Badge>
            <Badge variant="outline">Outline</Badge>
          </div>
        </div>
      </div>

      {/* Color Palette */}
      <div className="container mx-auto px-4 pb-16">
        <h2 className="mb-6 text-2xl font-semibold text-slate-900 dark:text-white">
          Color Palette (#3a5a40)
        </h2>
        <div className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-5">
          <div>
            <div className="mb-2 h-20 rounded-xl bg-primary-50 border border-primary-200" />
            <p className="text-xs font-mono text-slate-600">primary-50</p>
          </div>
          <div>
            <div className="mb-2 h-20 rounded-xl bg-primary-100 border border-primary-200" />
            <p className="text-xs font-mono text-slate-600">primary-100</p>
          </div>
          <div>
            <div className="mb-2 h-20 rounded-xl bg-primary-300 border border-primary-400" />
            <p className="text-xs font-mono text-slate-600">primary-300</p>
          </div>
          <div>
            <div className="mb-2 h-20 rounded-xl bg-primary-500 border border-primary-600" />
            <p className="text-xs font-mono text-white">primary-500</p>
          </div>
          <div>
            <div className="mb-2 h-20 rounded-xl bg-primary-600 border border-primary-700 flex items-center justify-center text-white font-bold">
              #3a5a40
            </div>
            <p className="text-xs font-mono text-slate-900 font-semibold">primary-600 ⭐</p>
          </div>
          <div>
            <div className="mb-2 h-20 rounded-xl bg-primary-700" />
            <p className="text-xs font-mono text-white">primary-700</p>
          </div>
          <div>
            <div className="mb-2 h-20 rounded-xl bg-primary-800" />
            <p className="text-xs font-mono text-white">primary-800</p>
          </div>
          <div>
            <div className="mb-2 h-20 rounded-xl bg-primary-900" />
            <p className="text-xs font-mono text-white">primary-900</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 py-8">
        <div className="container mx-auto px-4 text-center text-sm text-slate-600 dark:text-slate-400">
          <p>
            SatisClient Design System · Powered by{' '}
            <span className="font-semibold text-primary-600 dark:text-primary-400">
              #3a5a40
            </span>
          </p>
        </div>
      </footer>
    </div>
  );
}
