'use client';

import { useState } from 'react';
import { Table } from '@/components/ui/table';
import { Modal, ModalFooter } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { DateRangePicker } from '@/components/ui/datepicker';
import { Select } from '@/components/ui/select';
import { useToast } from '@/components/ui/toast';
import { useFeedbacks, useFeedbackStats, useUpdateFeedback } from '@/hooks';
import { getErrorMessage } from '@/lib/api/client';
import type { Feedback, FeedbackFilters } from '@/types/api';
import { Filter, Download, Eye } from 'lucide-react';
import { SkeletonTable } from '@/components/ui/skeleton';

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

export default function FeedbacksPage() {
  const [filters, setFilters] = useState<FeedbackFilters>({ page: 1, pageSize: 10 });
  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const { addToast } = useToast();

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [filterType, setFilterType] = useState('');

  // Hooks API
  const { data: feedbacksData, isLoading, error } = useFeedbacks(filters);
  const { data: stats, changes } = useFeedbackStats();
  const updateFeedback = useUpdateFeedback();

  const feedbacks = feedbacksData?.data || [];
  const totalPages = feedbacksData?.meta?.totalPages || 1;

  const handleChangeStatus = (processed: boolean) => {
    if (selectedFeedback) {
      updateFeedback.mutate(
        { id: selectedFeedback.id, data: { isProcessed: processed } as any },
        {
          onSuccess: () => {
            setShowDetailModal(false);
          },
        }
      );
    }
  };

  const columns = [
    {
      key: 'respondentName',
      label: 'CLIENT',
      sortable: true,
      render: (feedback: any) => (
        <span className="text-sm text-slate-600 dark:text-slate-400">
          {feedback.respondentName || 'Anonyme'}
        </span>
      ),
    },
    {
      key: 'feedbackChannel',
      label: 'CANAL',
      render: (feedback: any) => {
        const labels: Record<string, string> = {
          web: 'Web', qr_code: 'QR Code', email: 'Email', in_app: 'In-App',
        };
        return <span className="text-sm text-slate-600 dark:text-slate-400">{labels[feedback.feedbackChannel] || feedback.feedbackChannel}</span>;
      },
    },
    {
      key: 'commentSentiment',
      label: 'SENTIMENT',
      render: (feedback: any) => {
        const colors: Record<string, string> = {
          positive: 'text-primary-600 dark:text-primary-400',
          negative: 'text-red-600 dark:text-red-400',
          neutral: 'text-amber-600 dark:text-amber-400',
          unknown: 'text-slate-500 dark:text-slate-500',
        };
        const labels: Record<string, string> = {
          positive: 'Positif', negative: 'Négatif', neutral: 'Neutre', unknown: '—'
        };
        const s = (feedback as any).commentSentiment || 'unknown';
        return <span className={`text-sm font-medium ${colors[s] || ''}`}>{labels[s] || s}</span>;
      },
    },
    {
      key: 'siteId',
      label: 'SITE',
      render: (feedback: any) => (
        <span className="text-sm text-slate-600 dark:text-slate-400">
          {feedback.site?.name || '—'}
        </span>
      ),
    },
    {
      key: 'isProcessed',
      label: 'STATUT',
      render: (feedback: any) => (
        <span className={`text-sm font-medium ${feedback.isProcessed ? 'text-primary-600 dark:text-primary-400' : 'text-blue-600 dark:text-blue-400'}`}>
          {feedback.isProcessed ? 'Traité' : 'Nouveau'}
        </span>
      ),
    },
    {
      key: 'createdAt',
      label: 'DATE',
      render: (feedback: Feedback) => (
        <span className="text-sm text-slate-600 dark:text-slate-400">
          {new Date(feedback.createdAt).toLocaleDateString('fr-FR')}
        </span>
      ),
    },
    {
      key: 'actions',
      label: '',
      render: (feedback: Feedback) => (
        <button
          onClick={() => {
            setSelectedFeedback(feedback);
            setShowDetailModal(true);
          }}
          className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-[#1a1a1a] transition-colors"
        >
          <Eye className="h-4 w-4 text-slate-600 dark:text-slate-400" />
        </button>
      ),
    },
  ];

  if (error) {
    const errorMessage = getErrorMessage(error);
    const isAuthError = errorMessage.includes('connecté');

    return (
      <div className="rounded-lg border border-red-200 dark:border-red-800/60 bg-red-50 dark:bg-red-900/20 p-6">
        <h3 className="text-lg font-semibold text-red-900 dark:text-red-200 mb-2">
          Erreur de chargement
        </h3>
        <p className="text-sm text-red-700 dark:text-red-300 mb-4">
          {errorMessage}
        </p>
        {isAuthError && (
          <Button
            variant="primary"
            size="sm"
            onClick={() => window.location.href = '/login'}
          >
            Se connecter
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-[34px] font-bold text-slate-900 dark:text-white leading-tight">
            Feedbacks
          </h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Gérez tous les retours clients
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowFilterModal(true)}
            className="flex items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-800/60 bg-white dark:bg-[#1a1a1a] px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#222222] active:scale-95 transition-all"
          >
            <Filter className="h-4 w-4" />
            <span className="hidden xs:inline">Filtrer</span>
          </button>
          <button
            onClick={() => {
              const rows = feedbacks.map((f: any) => [
                f.respondentName || 'Anonyme',
                f.respondentEmail || '',
                f.commentSentiment || '',
                f.overallRating ?? '',
                f.comment?.replace(/"/g, '""') || '',
                f.feedbackChannel || '',
                f.site?.name || '',
                new Date(f.createdAt).toLocaleDateString('fr-FR'),
              ]);
              const header = ['Client','Email','Sentiment','Note','Commentaire','Canal','Site','Date'];
              const csv = [header, ...rows].map(r => r.map(v => `"${v}"`).join(',')).join('\n');
              const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url; a.download = `feedbacks-${new Date().toISOString().split('T')[0]}.csv`;
              a.click(); URL.revokeObjectURL(url);
            }}
            className="flex items-center gap-2 rounded-xl bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 active:scale-95 transition-all shadow-sm"
          >
            <Download className="h-4 w-4" />
            <span className="hidden xs:inline">Exporter</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Feedbacks"
          value={(stats?.total ?? 0).toString()}
          change={changes?.total != null ? `${changes.total > 0 ? '+' : ''}${changes.total}%` : '—'}
          isPositive={(changes?.total ?? 0) >= 0}
        />
        <StatCard
          label="Positifs"
          value={((stats as any)?.bySentiment?.positive ?? 0).toString()}
          change={changes?.positive != null ? `${changes.positive > 0 ? '+' : ''}${changes.positive}%` : '—'}
          isPositive={(changes?.positive ?? 0) >= 0}
        />
        <StatCard
          label="En attente"
          value={((stats as any)?.unprocessed ?? feedbacks.filter((f: any) => !f.isProcessed).length).toString()}
          change={(stats as any)?.total>0 ? `${Math.round(((stats as any)?.unprocessed??0)/((stats as any)?.total??1)*100)}%` : '—'}
          isPositive={((stats as any)?.needsResponse ?? 0) === 0}
        />
        <StatCard
          label="Note moyenne"
          value={stats?.averageRating != null ? `${stats.averageRating.toFixed(1)}/5` : '0/5'}
          change={changes?.avgRating != null ? `${changes.avgRating > 0 ? '+' : ''}${changes.avgRating}` : '—'}
          isPositive={(changes?.avgRating ?? 0) >= 0}
        />
      </div>

      {/* Table */}
      {isLoading ? (
        <SkeletonTable />
      ) : feedbacks.length === 0 ? (
        <div className="text-center py-12 rounded-lg border border-slate-200 dark:border-slate-800/60 bg-slate-50 dark:bg-[#0f0f0f]">
          <p className="text-slate-600 dark:text-slate-400">Aucun feedback pour le moment</p>
        </div>
      ) : (
        <Table
          data={feedbacks}
          columns={columns}
          pagination={{
            page: filters.page || 1,
            pageSize: filters.pageSize || 10,
            total: (stats as any)?.total ?? feedbacksData?.meta.total ?? 0,
            onPageChange: (newPage) => setFilters({ ...filters, page: newPage }),
          }}
          sortable
        />
      )}

      {/* Detail Modal */}
      {selectedFeedback && (
        <Modal
          open={showDetailModal}
          onClose={() => setShowDetailModal(false)}
          title="Détails du feedback"
          size="lg"
        >
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Client
                </label>
                <p className="text-slate-900 dark:text-white">{(selectedFeedback as any).respondentName || 'Anonyme'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Site
                </label>
                <p className="text-slate-900 dark:text-white">{(selectedFeedback as any).site?.name || '—'}</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Contenu
              </label>
              <div className="rounded-lg bg-slate-50 dark:bg-[#0f0f0f] p-4 border border-slate-200 dark:border-slate-800/60">
                <p className="text-slate-900 dark:text-white">{(selectedFeedback as any).comment}</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Changer le statut
              </label>
              <div className="flex gap-3">
                <Button
                  variant={!(selectedFeedback as any).isProcessed ? 'primary' : 'outline'}
                  onClick={() => handleChangeStatus(false)}
                  size="sm"
                >
                  Nouveau
                </Button>
                <Button
                  variant={(selectedFeedback as any).isProcessed ? 'primary' : 'outline'}
                  onClick={() => handleChangeStatus(true)}
                  size="sm"
                >
                  Traité
                </Button>
              </div>
            </div>
          </div>

          <ModalFooter>
            <Button variant="outline" onClick={() => setShowDetailModal(false)}>
              Fermer
            </Button>
          </ModalFooter>
        </Modal>
      )}

      {/* Filter Modal */}
      <Modal
        open={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        title="Filtres"
        size="md"
      >
        <div className="space-y-4">
          <DateRangePicker
            label="Période"
            startDate={startDate}
            endDate={endDate}
            onStartDateChange={setStartDate}
            onEndDateChange={setEndDate}
          />
          <Select
            label="Sentiment"
            options={[
              { value: '', label: 'Tous' },
              { value: 'positive', label: 'Positif' },
              { value: 'neutral', label: 'Neutre' },
              { value: 'negative', label: 'Négatif' },
            ]}
            value={filterType}
            onChange={setFilterType}
          />
        </div>

        <ModalFooter>
          <Button variant="outline" onClick={() => setShowFilterModal(false)}>
            Annuler
          </Button>
          <Button variant="primary" onClick={() => {
            setFilters(prev => ({
              ...prev,
              page: 1,
              commentSentiment: filterType || undefined,
              startDate: startDate || undefined,
              endDate: endDate || undefined,
            }));
            setShowFilterModal(false);
          }}>
            Appliquer
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
