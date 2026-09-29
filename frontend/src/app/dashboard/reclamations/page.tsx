'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Table } from '@/components/ui/table';
import { Modal, ModalFooter } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Tabs, TabPanel } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/toast';
import { reclamationsApi } from '@/lib/api/reclamations';
import { getErrorMessage } from '@/lib/api/client';
import { useSites } from '@/hooks';
import type { Reclamation, ReclamationFilters } from '@/types/api';
import { Plus, Eye, MessageCircle, Clock, CheckCircle } from 'lucide-react';
import { SkeletonTable } from '@/components/ui/skeleton';
import { UserAutocomplete } from '@/components/ui/user-autocomplete';

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

export default function ReclamationsPage() {
  const [filters, setFilters] = useState<ReclamationFilters>({ page: 1, pageSize: 20 });
  const [selectedReclamation, setSelectedReclamation] = useState<Reclamation | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState({ title: '', category: '', priority: 'normal', description: '', complainantName: '', complainantEmail: '' });
  const [createSiteId, setCreateSiteId] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const { addToast } = useToast();
  const queryClient = useQueryClient();

  // Sites pour la sélection
  const { data: sitesData } = useSites();
  const siteOptions = (sitesData?.data || []).map((s: any) => ({ value: s.id, label: s.name }));

  // Queries
  const { data: reclamationsData, isLoading, error } = useQuery({
    queryKey: ['reclamations', filters],
    queryFn: () => reclamationsApi.getAll(filters),
  });
  const { data: stats } = useQuery({
    queryKey: ['reclamations', 'stats', '30d'],
    queryFn: () => reclamationsApi.getStats('30d'),
  });
  const { data: stats90 } = useQuery({
    queryKey: ['reclamations', 'stats', '90d'],
    queryFn: () => reclamationsApi.getStats('90d'),
  });

  const calcChange = (curr: number, prev90: number) => {
    const prev30 = Math.round((prev90 - curr) / 2);
    if (prev30 === 0) return null;
    return Math.round(((curr - prev30) / prev30) * 100);
  };
  const totalChange = stats && stats90 ? calcChange(stats.total, stats90.total) : null;
  const urgentChange = stats && stats90
    ? calcChange(stats.byPriority?.urgent ?? 0, stats90.byPriority?.urgent ?? 0)
    : null;

  const reclamations = reclamationsData?.data || [];

  // Mutations
  const updateReclamation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      reclamationsApi.update(id, { status: status as Reclamation['status'] }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reclamations'] });
      addToast({ type: 'success', title: 'Statut mis à jour' });
      setShowDetailModal(false);
    },
    onError: (err) =>
      addToast({ type: 'error', title: 'Erreur', description: getErrorMessage(err) }),
  });

  const deleteReclamation = useMutation({
    mutationFn: (id: string) => reclamationsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reclamations'] });
      addToast({ type: 'success', title: 'Réclamation supprimée' });
    },
    onError: (err) =>
      addToast({ type: 'error', title: 'Erreur', description: getErrorMessage(err) }),
  });

  const getPriorityColor = (priority: string) => {
    const p = (priority || '').toLowerCase();
    if (p === 'low') return 'text-blue-600 dark:text-blue-400';
    if (p === 'normal') return 'text-amber-600 dark:text-amber-400';
    if (p === 'high') return 'text-orange-600 dark:text-orange-400';
    if (p === 'urgent') return 'text-red-600 dark:text-red-400';
    return '';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'received': case 'qualified': return 'text-blue-600 dark:text-blue-400';
      case 'assigned': case 'in_progress': return 'text-amber-600 dark:text-amber-400';
      case 'resolved': return 'text-primary-600 dark:text-primary-400';
      case 'closed': case 'rejected': return 'text-slate-600 dark:text-slate-400';
      default: return '';
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      received: 'Reçue', qualified: 'Qualifiée', assigned: 'Assignée',
      in_progress: 'En cours', awaiting_info: 'En attente', on_hold: 'En pause',
      resolved: 'Résolue', closed: 'Fermée', rejected: 'Rejetée', reopened: 'Réouverte',
    };
    return labels[status] || status;
  };

  const handleChangeStatus = (status: string) => {
    if (selectedReclamation) {
      updateReclamation.mutate({ id: selectedReclamation.id, status });
    }
  };

  const filteredReclamations = reclamations.filter(r => {
    if (activeTab === 'all') return true;
    if (activeTab === 'pending') return ['received', 'qualified'].includes(r.status as string);
    if (activeTab === 'in_progress') return ['assigned', 'in_progress'].includes(r.status as string);
    if (activeTab === 'resolved') return ['resolved', 'closed'].includes(r.status as string);
    return true;
  });

  const columns = [
    {
      key: 'title',
      label: 'TITRE',
      sortable: true,
      render: (r: Reclamation) => (
        <div>
          <p className="font-medium text-slate-900 dark:text-white">{r.title}</p>
          <p className="text-xs text-slate-600 dark:text-slate-400">{r.category}</p>
        </div>
      ),
    },
    {
      key: 'complainantName',
      label: 'CLIENT',
      render: (r: any) => (
        <span className="text-sm text-slate-700 dark:text-slate-300">
          {r.complainantName || 'Anonyme'}
        </span>
      ),
    },
    {
      key: 'site',
      label: 'SITE',
      render: (r: any) => (
        <span className="text-sm text-slate-600 dark:text-slate-400">
          {r.site?.name || '—'}
        </span>
      ),
    },
    {
      key: 'priority',
      label: 'PRIORITÉ',
      render: (r: any) => (
        <span className={`text-sm font-medium ${getPriorityColor(r.priority)}`}>
          {r.priority === 'low' ? 'Basse' :
           r.priority === 'normal' ? 'Normale' :
           r.priority === 'high' ? 'Haute' : 'Urgente'}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'STATUT',
      render: (r: Reclamation) => (
        <span className={`text-sm font-medium ${getStatusColor(r.status as string)}`}>
          {getStatusLabel(r.status as string)}
        </span>
      ),
    },
    {
      key: 'createdAt',
      label: 'DATE',
      render: (r: Reclamation) => (
        <span className="text-sm text-slate-600 dark:text-slate-400">
          {new Date(r.createdAt).toLocaleDateString('fr-FR')}
        </span>
      ),
    },
    {
      key: 'actions',
      label: '',
      render: (r: Reclamation) => (
        <button
          onClick={() => {
            setSelectedReclamation(r);
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
    { id: 'all', label: 'Toutes', badge: stats?.total ?? reclamations.length },
    { id: 'pending', label: 'En attente', badge: (stats?.byStatus?.received ?? 0) + (stats?.byStatus?.qualified ?? 0) },
    { id: 'in_progress', label: 'En cours', badge: (stats?.byStatus?.in_progress ?? 0) + (stats?.byStatus?.assigned ?? 0) },
    { id: 'resolved', label: 'Résolues', badge: (stats?.byStatus?.resolved ?? 0) + (stats?.byStatus?.closed ?? 0) },
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
            Réclamations
          </h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Gérez et suivez toutes les réclamations clients
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 rounded-xl bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 active:scale-95 transition-all shadow-sm"
        >
          <Plus className="h-4 w-4" />
          <span className="hidden xs:inline">Nouvelle réclamation</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="En attente" value={((stats?.byStatus?.received ?? 0) + (stats?.byStatus?.qualified ?? 0)).toString()} change={totalChange != null ? `${totalChange > 0 ? '+' : ''}${totalChange}%` : '—'} isPositive={(totalChange ?? 0) <= 0} />
        <StatCard label="En cours" value={((stats?.byStatus?.in_progress ?? 0) + (stats?.byStatus?.assigned ?? 0)).toString()} change={(stats?.total??0)>0 ? `${Math.round((((stats?.byStatus?.in_progress??0)+(stats?.byStatus?.assigned??0))/(stats?.total??1))*100)}%` : '—'} isPositive={false} />
        <StatCard label="Résolues" value={((stats?.byStatus?.resolved ?? 0) + (stats?.byStatus?.closed ?? 0)).toString()} change={totalChange != null ? `${totalChange > 0 ? '+' : ''}${totalChange}%` : '—'} isPositive={(totalChange ?? 0) >= 0} />
        <StatCard label="Urgentes" value={(stats?.byPriority?.urgent ?? 0).toString()} change={urgentChange != null ? `${urgentChange > 0 ? '+' : ''}${urgentChange}%` : '—'} isPositive={(urgentChange ?? 0) <= 0} />
      </div>

      {/* Tabs + Table */}
      <Tabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} variant="pills">
        <TabPanel tabId={activeTab}>
          {isLoading ? (
            <SkeletonTable />
          ) : filteredReclamations.length === 0 ? (
            <div className="text-center py-12 rounded-lg border border-slate-200 dark:border-slate-800/60 bg-slate-50 dark:bg-[#0f0f0f]">
              <p className="text-slate-600 dark:text-slate-400">Aucune réclamation pour le moment</p>
            </div>
          ) : (
            <Table
              data={filteredReclamations}
              columns={columns}
              pagination={{
                page: filters.page || 1,
                pageSize: 20,
                total: stats?.total ?? filteredReclamations.length,
                onPageChange: (newPage) => setFilters(prev => ({ ...prev, page: newPage })),
              }}
              sortable
            />
          )}
        </TabPanel>
      </Tabs>

      {/* Detail Modal */}
      {selectedReclamation && (
        <Modal
          open={showDetailModal}
          onClose={() => setShowDetailModal(false)}
          title="Détails de la réclamation"
          size="lg"
        >
          <div className="space-y-6">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                  {selectedReclamation.title}
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                  {selectedReclamation.category}
                </p>
              </div>
              <span className={`text-sm font-medium px-3 py-1 rounded-lg bg-slate-50 dark:bg-[#1a1a1a] ${getPriorityColor(selectedReclamation.priority)}`}>
                {(selectedReclamation as any).priority === 'low' ? 'Basse' :
                 (selectedReclamation as any).priority === 'normal' ? 'Normale' :
                 (selectedReclamation as any).priority === 'high' ? 'Haute' : 'Urgente'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Client
                </label>
                <p className="text-slate-900 dark:text-white">{(selectedReclamation as any).complainantName || 'Anonyme'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Site
                </label>
                <p className="text-slate-900 dark:text-white">{(selectedReclamation as any).site?.name || (selectedReclamation as any).siteId || '—'}</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Description
              </label>
              <div className="rounded-lg bg-slate-50 dark:bg-[#0f0f0f] p-4 border border-slate-200 dark:border-slate-800/60">
                <p className="text-slate-900 dark:text-white">{selectedReclamation.description}</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                Workflow
              </label>
              <div className="flex gap-2">
                <Button
                  variant={selectedReclamation.status === 'received' ? 'primary' : 'outline'}
                  onClick={() => handleChangeStatus('received')}
                  size="sm"
                  className="flex-1"
                  disabled={updateReclamation.isPending}
                >
                  <Clock className="h-4 w-4 mr-1.5" />
                  En attente
                </Button>
                <Button
                  variant={selectedReclamation.status === 'in_progress' ? 'primary' : 'outline'}
                  onClick={() => handleChangeStatus('in_progress')}
                  size="sm"
                  className="flex-1"
                  disabled={updateReclamation.isPending}
                >
                  <MessageCircle className="h-4 w-4 mr-1.5" />
                  En cours
                </Button>
                <Button
                  variant={selectedReclamation.status === 'resolved' ? 'primary' : 'outline'}
                  onClick={() => handleChangeStatus('resolved')}
                  size="sm"
                  className="flex-1"
                  disabled={updateReclamation.isPending}
                >
                  <CheckCircle className="h-4 w-4 mr-1.5" />
                  Résolue
                </Button>
              </div>
            </div>
          </div>

          <ModalFooter>
            <Button
              variant="outline"
              onClick={() => {
                if (selectedReclamation) {
                  deleteReclamation.mutate(selectedReclamation.id);
                  setShowDetailModal(false);
                }
              }}
              disabled={deleteReclamation.isPending}
              className="text-red-600 dark:text-red-400 border-red-200 dark:border-red-800/60 hover:bg-red-50 dark:hover:bg-red-900/20"
            >
              Supprimer
            </Button>
            <Button variant="outline" onClick={() => setShowDetailModal(false)}>
              Fermer
            </Button>
          </ModalFooter>
        </Modal>
      )}

      {/* Create Modal */}
      <Modal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Nouvelle réclamation"
        size="lg"
      >
        <div className="space-y-4">
          <Input
            label="Titre"
            placeholder="Ex: Délai de traitement trop long (min. 5 caractères)"
            required
            value={createForm.title}
            onChange={e => setCreateForm(f => ({ ...f, title: e.target.value }))}
            error={createForm.title.length > 0 && createForm.title.length < 5 ? `${createForm.title.length}/5 caractères minimum` : undefined}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Catégorie"
              options={[
                { value: 'service', label: 'Service' },
                { value: 'personnel', label: 'Personnel' },
                { value: 'délai', label: 'Délai' },
                { value: 'documentation', label: 'Documentation' },
                { value: 'facturation', label: 'Facturation' },
              ]}
              placeholder="Catégorie"
              value={createForm.category}
              onChange={val => setCreateForm(f => ({ ...f, category: val }))}
            />
            <Select
              label="Priorité"
              options={[
                { value: 'low', label: 'Basse' },
                { value: 'normal', label: 'Normale' },
                { value: 'high', label: 'Haute' },
                { value: 'urgent', label: 'Urgente' },
              ]}
              value={createForm.priority}
              onChange={val => setCreateForm(f => ({ ...f, priority: val }))}
            />
          </div>
          <div>
            <Textarea
              label="Description"
              placeholder="Décrivez la réclamation en détail (min. 20 caractères)..."
              rows={3}
              required
              value={createForm.description}
              onChange={e => setCreateForm(f => ({ ...f, description: e.target.value }))}
            />
            {createForm.description.length > 0 && createForm.description.length < 20 && (
              <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                {createForm.description.length}/20 caractères minimum requis
              </p>
            )}
          </div>
          <Select
            label="Site concerné"
            options={siteOptions}
            placeholder="Sélectionner un site"
            required
            value={createSiteId}
            onChange={(val) => setCreateSiteId(val)}
          />
          <UserAutocomplete
            label="Client concerné"
            placeholder="Rechercher un client ou saisir un nom..."
            value={createForm.complainantName}
            onSelect={(user) => {
              if (user) {
                setCreateForm(f => ({ ...f, complainantName: user.name, complainantEmail: user.email }));
              }
            }}
            onNameChange={(name) => setCreateForm(f => ({ ...f, complainantName: name }))}
          />
          {createForm.complainantEmail && (
            <Input
              label="Email client"
              value={createForm.complainantEmail}
              onChange={e => setCreateForm(f => ({ ...f, complainantEmail: e.target.value }))}
            />
          )}
        </div>

        <ModalFooter>
          <Button variant="outline" onClick={() => { setShowCreateModal(false); setCreateForm({ title: '', category: '', priority: 'normal', description: '', complainantName: '', complainantEmail: '' }); setCreateSiteId(''); }}>
            Annuler
          </Button>
          <Button
            variant="primary"
            disabled={!createForm.title || createForm.title.length < 5 || !createForm.description || createForm.description.length < 20 || !createSiteId}
            onClick={async () => {
              try {
                await reclamationsApi.create({
                  title: createForm.title,
                  description: createForm.description,
                  category: createForm.category,
                  priority: createForm.priority as any,
                  complainantName: createForm.complainantName || undefined,
                  complainantEmail: createForm.complainantEmail || undefined,
                  siteId: createSiteId,
                } as any);
                addToast({ type: 'success', title: 'Réclamation créée' });
                setShowCreateModal(false);
                setCreateForm({ title: '', category: '', priority: 'normal', description: '', complainantName: '', complainantEmail: '' });
                setCreateSiteId('');
                queryClient.invalidateQueries({ queryKey: ['reclamations'] });
              } catch (e) {
                addToast({ type: 'error', title: 'Erreur', description: 'Impossible de créer la réclamation' });
              }
            }}
          >
            Créer
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
