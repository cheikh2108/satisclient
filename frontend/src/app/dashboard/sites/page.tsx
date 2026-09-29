'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Table } from '@/components/ui/table';
import { Modal, ModalFooter } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';
import { useSites, useSiteStats, useCreateSite, useUpdateSite, useDeleteSite, useCurrentUser, useFeedbackStats } from '@/hooks';
import { getErrorMessage } from '@/lib/api/client';
import type { Site, SiteFilters } from '@/types/api';
import { MapPin, Plus, Eye, Edit, Trash2, Building2 } from 'lucide-react';
import { SkeletonTable } from '@/components/ui/skeleton';

const siteSchema = z.object({
  name: z.string().min(2, 'Minimum 2 caractères'),
  code: z.string().optional(),
  type: z.enum(['organization', 'region', 'agency', 'service', 'point']),
  city: z.string().optional(),
  region: z.string().optional(),
  country: z.string().default('SN'),
  isActive: z.boolean().default(true),
});

type SiteFormValues = z.infer<typeof siteSchema>;

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

export default function SitesPage() {
  const [filters, setFilters] = useState<SiteFilters>({ page: 1, pageSize: 10 });
  const [selectedSite, setSelectedSite] = useState<Site | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const { addToast } = useToast();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<SiteFormValues>({
    resolver: zodResolver(siteSchema),
    defaultValues: { country: 'SN', isActive: true },
  });

  // Hooks API
  const { data: sitesData, isLoading, error } = useSites(filters);
  const { data: stats } = useSiteStats();
  const { data: currentUser } = useCurrentUser();
  const { data: feedbackStats } = useFeedbackStats();
  const deleteSite = useDeleteSite();
  const createSite = useCreateSite();
  const updateSite = useUpdateSite();

  const sites = sitesData?.data || [];

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'organization': return 'Organisation';
      case 'region': return 'Région';
      case 'agency': return 'Agence';
      case 'service': return 'Service';
      case 'point': return 'Point de vente';
      default: return type || '—';
    }
  };

  const getActiveColor = (isActive: boolean) => {
    return isActive
      ? 'text-primary-600 dark:text-primary-400'
      : 'text-slate-500 dark:text-slate-500';
  };

  const handleDelete = (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce site ?')) {
      deleteSite.mutate(id);
    }
  };

  const onSubmit = handleSubmit(async (data) => {
    if (selectedSite) {
      await updateSite.mutateAsync({ id: selectedSite.id, data });
    } else {
      await createSite.mutateAsync({ ...data, organizationId: currentUser?.organizationId ?? '' });
    }
    setShowCreateModal(false);
    setShowEditModal(false);
    reset();
  });

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

  const columns = [
    {
      key: 'name',
      label: 'NOM',
      sortable: true,
      render: (site: Site) => (
        <div>
          <p className="font-medium text-slate-900 dark:text-white">{site.name}</p>
          <p className="text-xs text-slate-600 dark:text-slate-400">{site.city}</p>
        </div>
      ),
    },
    {
      key: 'type',
      label: 'TYPE',
      render: (site: Site) => (
        <span className="text-sm text-slate-600 dark:text-slate-400">
          {getTypeLabel(site.type)}
        </span>
      ),
    },
    {
      key: 'country',
      label: 'PAYS',
      render: (site: Site) => (
        <span className="text-sm text-slate-600 dark:text-slate-400">{site.country ?? '—'}</span>
      ),
    },
    {
      key: 'isActive',
      label: 'STATUT',
      render: (site: Site) => (
        <span className={`text-sm font-medium ${getActiveColor(site.isActive)}`}>
          {site.isActive ? 'Actif' : 'Inactif'}
        </span>
      ),
    },
    {
      key: 'code',
      label: 'CODE',
      render: (site: Site) => (
        <span className="text-sm text-slate-600 dark:text-slate-400 font-mono">{site.code || '—'}</span>
      ),
    },
    {
      key: 'actions',
      label: '',
      render: (site: Site) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setSelectedSite(site);
              setShowDetailModal(true);
            }}
            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-[#1a1a1a] transition-colors"
          >
            <Eye className="h-4 w-4 text-slate-600 dark:text-slate-400" />
          </button>
          <button
            onClick={() => {
              setSelectedSite(site);
              reset({
                name: site.name,
                code: site.code ?? undefined,
                type: site.type as SiteFormValues['type'],
                city: site.city ?? '',
                region: site.region ?? '',
                country: site.country ?? 'SN',
                isActive: site.isActive,
              });
              setShowEditModal(true);
            }}
            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-[#1a1a1a] transition-colors"
          >
            <Edit className="h-4 w-4 text-slate-600 dark:text-slate-400" />
          </button>
          <button
            onClick={() => handleDelete(site.id)}
            className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          >
            <Trash2 className="h-4 w-4 text-red-600 dark:text-red-400" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-[34px] font-bold text-slate-900 dark:text-white leading-tight">
            Sites
          </h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Gérez tous vos établissements
          </p>
        </div>
        <button
          onClick={() => {
            setSelectedSite(null);
            reset({ name: '', city: '', region: '', country: 'SN', isActive: true });
            setShowCreateModal(true);
          }}
          className="flex items-center gap-2 rounded-xl bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 active:scale-95 transition-all shadow-sm"
        >
          <Plus className="h-4 w-4" />
          <span className="hidden xs:inline">Nouveau site</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Sites" value={(stats?.total ?? sites.length).toString()} change={(stats?.total??0)>0 ? `${Math.round(((stats?.active??0)/(stats?.total??1))*100)}%` : '—'} isPositive />
        <StatCard label="Actifs" value={(stats?.active ?? sites.filter((s: any) => s.isActive).length).toString()} change={`${Math.round((sites.filter((s: any) => s.isActive).length / Math.max(sites.length, 1)) * 100)}%`} isPositive />
        <StatCard label="Feedbacks (30j)" value={(feedbackStats?.total ?? 0).toString()} change={(feedbackStats?.total??0)>0 ? `${Math.round(((feedbackStats as any)?.bySentiment?.positive??0)/(feedbackStats?.total??1)*100)}%` : '—'} isPositive />
        <StatCard label="Note moyenne" value={feedbackStats?.averageRating ? `${feedbackStats.averageRating.toFixed(1)}/5` : '—'} change="—" isPositive={(feedbackStats?.averageRating ?? 0) >= 3} />
      </div>

      {/* Table */}
      {isLoading ? (
        <SkeletonTable />
      ) : sites.length === 0 ? (
        <div className="text-center py-12 rounded-lg border border-slate-200 dark:border-slate-800/60 bg-slate-50 dark:bg-[#0f0f0f]">
          <p className="text-slate-600 dark:text-slate-400">Aucun site pour le moment</p>
        </div>
      ) : (
        <Table
          data={sites}
          columns={columns}
          pagination={{
            page: filters.page || 1,
            pageSize: filters.pageSize || 10,
            total: sitesData?.meta.total || 0,
            onPageChange: (newPage) => setFilters({ ...filters, page: newPage }),
          }}
          sortable
        />
      )}

      {/* Detail Modal */}
      {selectedSite && (
        <Modal
          open={showDetailModal}
          onClose={() => setShowDetailModal(false)}
          title="Détails du site"
          size="lg"
        >
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="h-16 w-16 rounded-xl bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center flex-shrink-0">
                <Building2 className="h-8 w-8 text-primary-600 dark:text-primary-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                  {selectedSite.name}
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                  {getTypeLabel(selectedSite.type)}
                </p>
              </div>
              <span className={`text-sm font-medium px-3 py-1 rounded-lg bg-slate-50 dark:bg-[#1a1a1a] ${getActiveColor(selectedSite.isActive)}`}>
                {selectedSite.isActive ? 'Actif' : 'Inactif'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Code
                </label>
                <p className="text-slate-900 dark:text-white font-mono">{selectedSite.code || '—'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Région
                </label>
                <p className="text-slate-900 dark:text-white">{selectedSite.region ?? '—'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Ville
                </label>
                <p className="text-slate-900 dark:text-white">{selectedSite.city ?? '—'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Pays
                </label>
                <p className="text-slate-900 dark:text-white font-semibold">{selectedSite.country ?? '—'}</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Localisation
              </label>
              <div className="rounded-lg bg-slate-50 dark:bg-[#0f0f0f] p-4 border border-slate-200 dark:border-slate-800/60">
                <p className="text-slate-900 dark:text-white">{selectedSite.city ?? '—'}{selectedSite.region ? `, ${selectedSite.region}` : ''}</p>
                <p className="text-slate-900 dark:text-white">{selectedSite.country ?? '—'}</p>
              </div>
            </div>
          </div>

          <ModalFooter>
            <Button variant="outline" onClick={() => setShowDetailModal(false)}>
              Fermer
            </Button>
            <Button variant="primary" onClick={() => {
              reset({
                name: selectedSite.name,
                code: selectedSite.code ?? undefined,
                type: selectedSite.type as SiteFormValues['type'],
                city: selectedSite.city ?? '',
                region: selectedSite.region ?? '',
                country: selectedSite.country ?? 'SN',
                isActive: selectedSite.isActive,
              });
              setShowDetailModal(false);
              setShowEditModal(true);
            }}>
              Modifier
            </Button>
          </ModalFooter>
        </Modal>
      )}

      {/* Create/Edit Modal */}
      <Modal
        open={showCreateModal || showEditModal}
        onClose={() => {
          setShowCreateModal(false);
          setShowEditModal(false);
          reset();
        }}
        title={showEditModal ? 'Modifier le site' : 'Nouveau site'}
        size="lg"
      >
        <div className="space-y-4">
          <Input
            label="Nom du site"
            placeholder="Ex: Paris Centre"
            required
            {...register('name')}
            error={errors.name?.message}
          />

          <Select
            label="Type"
            options={[
              { value: 'organization', label: 'Organisation' },
              { value: 'region', label: 'Région' },
              { value: 'agency', label: 'Agence' },
              { value: 'service', label: 'Service' },
              { value: 'point', label: 'Point de vente' },
            ]}
            placeholder="Sélectionner un type"
            required
            value={watch('type') ?? ''}
            onChange={(val) => setValue('type', val as SiteFormValues['type'], { shouldValidate: true })}
            error={errors.type?.message}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Ville"
              placeholder="Dakar"
              {...register('city')}
              error={errors.city?.message}
            />
            <Input
              label="Région"
              placeholder="Dakar"
              {...register('region')}
              error={errors.region?.message}
            />
          </div>

          <Input
            label="Pays"
            placeholder="SN"
            {...register('country')}
            error={errors.country?.message}
          />

          <Select
            label="Statut"
            options={[
              { value: 'true', label: 'Actif' },
              { value: 'false', label: 'Inactif' },
            ]}
            placeholder="Sélectionner un statut"
            required
            value={watch('isActive') ? 'true' : 'false'}
            onChange={(val) => setValue('isActive', val === 'true', { shouldValidate: true })}
            error={errors.isActive?.message}
          />
        </div>

        <ModalFooter>
          <Button variant="outline" onClick={() => {
            setShowCreateModal(false);
            setShowEditModal(false);
            reset();
          }}>
            Annuler
          </Button>
          <Button
            variant="primary"
            onClick={onSubmit}
            disabled={isSubmitting}
          >
            {showEditModal ? 'Enregistrer' : 'Créer'}
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
