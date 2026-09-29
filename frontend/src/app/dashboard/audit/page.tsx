'use client';

import { useState } from 'react';
import { Table } from '@/components/ui/table';
import { Modal, ModalFooter } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { DateRangePicker } from '@/components/ui/datepicker';
import { Tabs, TabPanel } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/toast';
import { useAuditLogs, useAuditStats, useUsers } from '@/hooks';
import type { AuditLog, AuditFilters } from '@/lib/api/audit';
import { FileCheck, Eye, Filter, Download, User, Clock, Activity } from 'lucide-react';
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

export default function AuditPage() {
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [auditFilters, setAuditFilters] = useState<AuditFilters>({ page: 1, pageSize: 20 });
  const { addToast } = useToast();

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [filterAction, setFilterAction] = useState('');
  const [filterUser, setFilterUser] = useState('');

  const { data: logsData, isLoading, error } = useAuditLogs(auditFilters);
  const { data: stats } = useAuditStats();
  const { data: usersData } = useUsers();

  const logs = logsData?.data || [];
  const usersList = usersData?.data || [];

  const getActionColor = (action: string) => {
    const a = (action || '').toLowerCase();
    if (a.includes('create')) return 'text-primary-600 dark:text-primary-400';
    if (a.includes('update') || a.includes('edit')) return 'text-blue-600 dark:text-blue-400';
    if (a.includes('delete') || a.includes('remove')) return 'text-red-600 dark:text-red-400';
    if (a.includes('login')) return 'text-green-600 dark:text-green-400';
    if (a.includes('logout')) return 'text-slate-600 dark:text-slate-400';
    if (a.includes('export')) return 'text-purple-600 dark:text-purple-400';
    return 'text-slate-600 dark:text-slate-400';
  };

  const getActionLabel = (action: string) => {
    const a = (action || '').toLowerCase();
    if (a.includes('create')) return 'Création';
    if (a.includes('update') || a.includes('edit')) return 'Modification';
    if (a.includes('delete') || a.includes('remove')) return 'Suppression';
    if (a.includes('login')) return 'Connexion';
    if (a.includes('logout')) return 'Déconnexion';
    if (a.includes('export')) return 'Export';
    // Fallback: prettify snake_case
    return action.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  };

  const handleExport = () => {
    const rows = filteredLogs.map((l: any) => [
      l.userEmail || '',
      l.action || '',
      l.entityType || '',
      l.ipAddress || '',
      l.success ? 'Succès' : 'Échec',
      new Date(l.createdAt).toLocaleString('fr-FR'),
    ]);
    const header = ['Utilisateur','Action','Entité','IP','Statut','Date'];
    const csv = [header, ...rows].map(r => r.map((v: any) => `"${v}"`).join(',')).join('\n');
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `audit-logs-${new Date().toISOString().split('T')[0]}.csv`;
    a.click(); URL.revokeObjectURL(url);
  };

  const filteredLogs = logs.filter(log => {
    if (activeTab === 'all') return true;
    const a = (log.action || '').toLowerCase();
    if (activeTab === 'create') return a.includes('create');
    if (activeTab === 'update') return a.includes('update') || a.includes('edit');
    if (activeTab === 'delete') return a.includes('delete') || a.includes('remove');
    if (activeTab === 'auth') return a.includes('login') || a.includes('logout');
    return true;
  });

  const columns = [
    {
      key: 'action',
      label: 'ACTION',
      render: (log: AuditLog) => (
        <span className={`text-sm font-medium ${getActionColor(log.action)}`}>
          {getActionLabel(log.action)}
        </span>
      ),
    },
    {
      key: 'entityType',
      label: 'ENTITÉ',
      render: (log: AuditLog) => (
        <div>
          <p className="text-sm font-medium text-slate-900 dark:text-white">{log.entityType}</p>
          {log.entityId && (
            <p className="text-xs text-slate-600 dark:text-slate-400">{log.entityId}</p>
          )}
        </div>
      ),
    },
    {
      key: 'userEmail',
      label: 'UTILISATEUR',
      render: (log: AuditLog) => (
        <div className="flex items-center gap-2">
          <User className="h-4 w-4 text-slate-400" />
          <span className="text-sm text-slate-900 dark:text-white">{log.userEmail ?? '—'}</span>
        </div>
      ),
    },
    {
      key: 'ipAddress',
      label: 'IP',
      render: (log: AuditLog) => (
        <span className="text-sm text-slate-600 dark:text-slate-400 font-mono">
          {log.ipAddress ?? '—'}
        </span>
      ),
    },
    {
      key: 'createdAt',
      label: 'DATE & HEURE',
      sortable: true,
      render: (log: AuditLog) => (
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-slate-400" />
          <span className="text-sm text-slate-600 dark:text-slate-400">
            {new Date(log.createdAt).toLocaleString('fr-FR')}
          </span>
        </div>
      ),
    },
    {
      key: 'actions',
      label: '',
      render: (log: AuditLog) => (
        <button
          onClick={() => {
            setSelectedLog(log);
            setShowDetailModal(true);
          }}
          className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-[#1a1a1a] transition-colors"
        >
          <Eye className="h-4 w-4 text-slate-600 dark:text-slate-400" />
        </button>
      ),
    },
  ];

  const tabs = [
    { id: 'all', label: 'Tous', badge: stats?.total ?? logs.length },
    { id: 'create', label: 'Créations', badge: stats?.byActionType?.create ?? 0 },
    { id: 'update', label: 'Modifications', badge: stats?.byActionType?.update ?? 0 },
    { id: 'delete', label: 'Suppressions', badge: stats?.byActionType?.delete ?? 0 },
    { id: 'auth', label: 'Authentification', badge: stats?.byActionType?.auth ?? 0 },
  ];

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-[34px] font-bold text-slate-900 dark:text-white leading-tight">
            Audit
          </h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Consultez l'historique de toutes les activités
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
            onClick={handleExport}
            className="flex items-center gap-2 rounded-xl bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 active:scale-95 transition-all shadow-sm"
          >
            <Download className="h-4 w-4" />
            <span className="hidden xs:inline">Exporter</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Logs" value={(stats?.total ?? 0).toString()} change="—" isPositive />
        <StatCard label="Aujourd'hui" value={(stats?.today ?? 0).toString()} change={(stats?.total ?? 0) > 0 ? `${Math.round(((stats?.today ?? 0) / (stats?.total ?? 1)) * 100)}% du total` : '—'} isPositive />
        <StatCard label="Utilisateurs actifs" value={(stats?.activeUsers ?? 0).toString()} change="—" isPositive />
        <StatCard label="Taux d'erreur" value={stats?.errorRate != null ? `${stats.errorRate.toFixed(1)}%` : '0%'} change="—" isPositive={(stats?.errorRate ?? 0) === 0} />
      </div>

      {/* Tabs + Table */}
      <Tabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} variant="pills">
        <TabPanel tabId={activeTab}>
          {isLoading ? (
            <SkeletonTable />
          ) : error ? (
            <div className="rounded-lg border border-red-200 dark:border-red-800/60 bg-red-50 dark:bg-red-900/20 p-6">
              <p className="text-sm text-red-700 dark:text-red-300">Erreur lors du chargement des logs d'audit</p>
            </div>
          ) : (
            <Table
              data={filteredLogs}
              columns={columns}
              pagination={{
                page: auditFilters.page || 1,
                pageSize: auditFilters.pageSize || 20,
                total: stats?.total ?? logsData?.meta.total ?? filteredLogs.length,
                onPageChange: (newPage) => setAuditFilters(prev => ({ ...prev, page: newPage })),
              }}
              sortable
            />
          )}
        </TabPanel>
      </Tabs>

      {/* Detail Modal */}
      {selectedLog && (
        <Modal
          open={showDetailModal}
          onClose={() => setShowDetailModal(false)}
          title="Détails du log"
          size="lg"
        >
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="h-16 w-16 rounded-xl bg-slate-100 dark:bg-[#1a1a1a] flex items-center justify-center flex-shrink-0">
                <Activity className="h-8 w-8 text-slate-600 dark:text-slate-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                  {getActionLabel(selectedLog.action)}
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                  {selectedLog.errorMessage ?? 'Aucun détail disponible'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Utilisateur
                </label>
                <p className="text-slate-900 dark:text-white">{selectedLog.userEmail ?? '—'}</p>
                <p className="text-xs text-slate-600 dark:text-slate-400">{selectedLog.userId ?? ''}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Date & Heure
                </label>
                <p className="text-slate-900 dark:text-white">
                  {new Date(selectedLog.createdAt).toLocaleString('fr-FR')}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Entité
                </label>
                <p className="text-slate-900 dark:text-white">{selectedLog.entityType}</p>
                {selectedLog.entityId && (
                  <p className="text-xs text-slate-600 dark:text-slate-400">{selectedLog.entityId}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Adresse IP
                </label>
                <p className="text-slate-900 dark:text-white font-mono">{selectedLog.ipAddress ?? '—'}</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                User Agent
              </label>
              <div className="rounded-lg bg-slate-50 dark:bg-[#0f0f0f] p-4 border border-slate-200 dark:border-slate-800/60">
                <p className="text-xs text-slate-900 dark:text-white font-mono break-all">
                  {selectedLog.userAgent ?? '—'}
                </p>
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
            label="Action"
            options={[
              { value: '', label: 'Toutes' },
              { value: 'create', label: 'Création' },
              { value: 'update', label: 'Modification' },
              { value: 'delete', label: 'Suppression' },
              { value: 'login', label: 'Connexion' },
              { value: 'logout', label: 'Déconnexion' },
              { value: 'export', label: 'Export' },
            ]}
            value={filterAction}
            onChange={setFilterAction}
          />
          <Select
            label="Utilisateur"
            options={[
              { value: '', label: 'Tous' },
              ...usersList.map(u => ({ value: u.id, label: u.email })),
            ]}
            value={filterUser}
            onChange={setFilterUser}
          />
        </div>

        <ModalFooter>
          <Button variant="outline" onClick={() => setShowFilterModal(false)}>
            Annuler
          </Button>
          <Button variant="primary" onClick={() => {
            setAuditFilters(prev => ({
              ...prev,
              page: 1,
              action: filterAction || undefined,
              userId: filterUser || undefined,
              startDate: startDate || undefined,
              endDate: endDate || undefined,
            }));
            addToast({ type: 'info', title: 'Filtres appliqués' });
            setShowFilterModal(false);
          }}>
            Appliquer
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
