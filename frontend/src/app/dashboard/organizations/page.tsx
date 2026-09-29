'use client';

import { useState } from 'react';
import { Table } from '@/components/ui/table';
import { Modal, ModalFooter } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import {
  useOrganizations,
  useOrganizationStats,
  useCreateOrganization,
  useUpdateOrganization,
  useDeleteOrganization,
} from '@/hooks';
import { getErrorMessage } from '@/lib/api/client';
import type { Organization, CreateOrganizationDto, UpdateOrganizationDto } from '@/types/api';
import type { OrganizationFilters } from '@/lib/api/organizations';
import { Building2, Plus, Eye, Edit, Trash2, Users, MapPin } from 'lucide-react';
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

const emptyForm: CreateOrganizationDto = {
  name: '',
  slug: '',
  email: '',
  subscriptionPlan: 'essentialiel',
};

export default function OrganizationsPage() {
  const [filters] = useState<OrganizationFilters>({ page: 1, pageSize: 50 });
  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [page, setPage] = useState(1);
  const [formData, setFormData] = useState<CreateOrganizationDto>(emptyForm);
  const [editData, setEditData] = useState<UpdateOrganizationDto>({});

  // Queries
  const { data: orgsData, isLoading, error } = useOrganizations(filters);
  const { data: stats } = useOrganizationStats();

  const organizations = orgsData?.data || [];

  // Mutations
  const createOrg = useCreateOrganization();
  const updateOrg = useUpdateOrganization();
  const deleteOrg = useDeleteOrganization();

  const getPlanLabel = (plan: string) => {
    const p = (plan || '').toLowerCase();
    const labels: Record<string, string> = {
      starter: 'Starter',
      essentialiel: 'Essentiel',
      essentiel: 'Essentiel',
      pro: 'Pro',
      business: 'Business',
      institution: 'Institution',
      enterprise: 'Enterprise',
      custom: 'Custom',
    };
    return labels[p] || plan;
  };

  const getPlanColor = (plan: string) => {
    const p = (plan || '').toLowerCase();
    if (p === 'starter') return 'text-blue-600 dark:text-blue-400';
    if (p === 'essentiel' || p === 'essentialiel') return 'text-primary-600 dark:text-primary-400';
    if (p === 'pro') return 'text-primary-600 dark:text-primary-400';
    if (p === 'business') return 'text-purple-600 dark:text-purple-400';
    if (p === 'institution') return 'text-amber-600 dark:text-amber-400';
    if (p === 'enterprise') return 'text-purple-600 dark:text-purple-400';
    if (p === 'custom') return 'text-amber-600 dark:text-amber-400';
    return '';
  };

  const getStatusColor = (status: string) => {
    const s = (status || '').toLowerCase();
    if (s === 'active') return 'text-primary-600 dark:text-primary-400';
    if (s === 'trial') return 'text-amber-600 dark:text-amber-400';
    if (s === 'suspended') return 'text-red-600 dark:text-red-400';
    if (s === 'expired') return 'text-slate-500 dark:text-slate-500';
    return '';
  };

  const getStatusLabel = (status: string) => {
    const s = (status || '').toLowerCase();
    if (s === 'active') return 'Actif';
    if (s === 'trial') return 'Essai';
    if (s === 'suspended') return 'Suspendu';
    if (s === 'expired') return 'Expiré';
    return status || '—';
  };

  const handleDelete = (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette organisation ?')) {
      deleteOrg.mutate(id);
    }
  };

  const handleCreate = () => {
    createOrg.mutate(formData, {
      onSuccess: () => {
        setFormData(emptyForm);
        setShowCreateModal(false);
      },
    });
  };

  const handleUpdate = () => {
    if (selectedOrg) {
      updateOrg.mutate(
        { id: selectedOrg.id, data: editData },
        {
          onSuccess: () => {
            setShowEditModal(false);
            setEditData({});
          },
        }
      );
    }
  };

  const columns = [
    {
      key: 'name',
      label: 'ORGANISATION',
      sortable: true,
      render: (org: Organization) => (
        <div>
          <p className="font-medium text-slate-900 dark:text-white">{org.name}</p>
          <p className="text-xs text-slate-600 dark:text-slate-400">{org.slug}</p>
        </div>
      ),
    },
    {
      key: 'industry',
      label: 'SECTEUR',
      render: () => (
        <span className="text-sm text-slate-400 dark:text-slate-600">—</span>
      ),
    },
    {
      key: 'subscriptionPlan',
      label: 'FORMULE',
      render: (org: Organization) => (
        <span className={`text-sm font-medium ${getPlanColor(org.subscriptionPlan)}`}>
          {getPlanLabel(org.subscriptionPlan)}
        </span>
      ),
    },
    {
      key: 'maxSites',
      label: 'MAX SITES',
      sortable: true,
      render: (org: Organization) => (
        <span className="font-semibold text-slate-900 dark:text-white tabular-nums">
          {org.maxSites ?? '—'}
        </span>
      ),
    },
    {
      key: 'maxUsers',
      label: 'MAX USERS',
      sortable: true,
      render: (org: Organization) => (
        <span className="font-semibold text-slate-900 dark:text-white tabular-nums">
          {org.maxUsers ?? '—'}
        </span>
      ),
    },
    {
      key: 'subscriptionStatus',
      label: 'STATUT',
      render: (org: Organization) => (
        <span className={`text-sm font-medium ${getStatusColor(org.subscriptionStatus)}`}>
          {getStatusLabel(org.subscriptionStatus)}
        </span>
      ),
    },
    {
      key: 'actions',
      label: '',
      render: (org: Organization) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setSelectedOrg(org);
              setShowDetailModal(true);
            }}
            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-[#1a1a1a] transition-colors"
          >
            <Eye className="h-4 w-4 text-slate-600 dark:text-slate-400" />
          </button>
          <button
            onClick={() => {
              setSelectedOrg(org);
              setEditData({
                name: org.name,
                subscriptionPlan: org.subscriptionPlan,
                subscriptionStatus: org.subscriptionStatus,
              });
              setShowEditModal(true);
            }}
            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-[#1a1a1a] transition-colors"
          >
            <Edit className="h-4 w-4 text-slate-600 dark:text-slate-400" />
          </button>
          <button
            onClick={() => handleDelete(org.id)}
            className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            disabled={deleteOrg.isPending}
          >
            <Trash2 className="h-4 w-4 text-red-600 dark:text-red-400" />
          </button>
        </div>
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
            Organisations
          </h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Gérez les organisations multi-tenant
          </p>
        </div>
        <button
          onClick={() => {
            setFormData(emptyForm);
            setShowCreateModal(true);
          }}
          className="flex items-center gap-2 rounded-xl bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 active:scale-95 transition-all shadow-sm"
        >
          <Plus className="h-4 w-4" />
          <span className="hidden xs:inline">Nouvelle organisation</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Organisations" value={(stats?.total ?? organizations.length).toString()} change={(stats?.total??0)>0 ? `${Math.round(((stats?.active??0)/(stats?.total??1))*100)}%` : '—'} isPositive />
        <StatCard label="Actives" value={(stats?.active ?? organizations.filter((o: any) => o.subscriptionStatus === 'active').length).toString()} change={(stats?.total ?? 0) > 0 ? `${Math.round(((stats?.active ?? 0) / (stats?.total ?? 1)) * 100)}% du total` : '—'} isPositive />
        <StatCard label="En essai" value={(stats?.trial ?? organizations.filter((o: any) => o.subscriptionStatus === 'trial').length).toString()} change="—" isPositive />
        <StatCard label="Suspendues" value={(stats?.suspended ?? organizations.filter((o: any) => o.subscriptionStatus === 'suspended').length).toString()} change="—" isPositive={(stats?.suspended ?? 0) === 0} />
      </div>

      {/* Table */}
      {isLoading ? (
        <SkeletonTable />
      ) : organizations.length === 0 ? (
        <div className="text-center py-12 rounded-lg border border-slate-200 dark:border-slate-800/60 bg-slate-50 dark:bg-[#0f0f0f]">
          <p className="text-slate-600 dark:text-slate-400">Aucune organisation pour le moment</p>
        </div>
      ) : (
        <Table
          data={organizations}
          columns={columns}
          pagination={{
            page,
            pageSize: 10,
            total: organizations.length,
            onPageChange: setPage,
          }}
          sortable
        />
      )}

      {/* Detail Modal */}
      {selectedOrg && (
        <Modal
          open={showDetailModal}
          onClose={() => setShowDetailModal(false)}
          title="Détails de l'organisation"
          size="lg"
        >
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="h-16 w-16 rounded-xl bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center flex-shrink-0">
                <Building2 className="h-8 w-8 text-primary-600 dark:text-primary-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                  {selectedOrg.name}
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                  {selectedOrg.slug}
                </p>
              </div>
              <span className={`text-sm font-medium px-3 py-1 rounded-lg bg-slate-50 dark:bg-[#1a1a1a] ${getStatusColor(selectedOrg.subscriptionStatus)}`}>
                {getStatusLabel(selectedOrg.subscriptionStatus)}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Formule
                </label>
                <p className={`font-medium ${getPlanColor(selectedOrg.subscriptionPlan)}`}>
                  {getPlanLabel(selectedOrg.subscriptionPlan)}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Email
                </label>
                <p className="text-slate-900 dark:text-white">{selectedOrg.email ?? '—'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Max sites
                </label>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-slate-400" />
                  <p className="text-slate-900 dark:text-white font-semibold">{selectedOrg.maxSites ?? '—'}</p>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Max utilisateurs
                </label>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-slate-400" />
                  <p className="text-slate-900 dark:text-white font-semibold">{selectedOrg.maxUsers ?? '—'}</p>
                </div>
              </div>
            </div>

            <div className="rounded-lg bg-slate-50 dark:bg-[#0f0f0f] p-4 border border-slate-200 dark:border-slate-800/60">
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Organisation créée le {new Date(selectedOrg.createdAt).toLocaleDateString('fr-FR')}
              </p>
            </div>
          </div>

          <ModalFooter>
            <Button variant="outline" onClick={() => setShowDetailModal(false)}>
              Fermer
            </Button>
            <Button variant="primary" onClick={() => {
              setEditData({
                name: selectedOrg.name,
                subscriptionPlan: selectedOrg.subscriptionPlan,
                subscriptionStatus: selectedOrg.subscriptionStatus,
              });
              setShowDetailModal(false);
              setShowEditModal(true);
            }}>
              Modifier
            </Button>
          </ModalFooter>
        </Modal>
      )}

      {/* Create Modal */}
      <Modal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Nouvelle organisation"
        size="lg"
      >
        <div className="space-y-4">
          <Input
            label="Nom de l'organisation"
            placeholder="Ex: Restaurant Le Gourmet"
            required
            value={formData.name}
            onChange={(e) => setFormData(f => ({ ...f, name: e.target.value }))}
          />
          <Input
            label="Slug"
            placeholder="restaurant-le-gourmet"
            helperText="URL unique pour l'organisation"
            required
            value={formData.slug}
            onChange={(e) => setFormData(f => ({ ...f, slug: e.target.value }))}
          />
          <Input
            label="Email"
            type="email"
            placeholder="contact@organisation.com"
            value={formData.email ?? ''}
            onChange={(e) => setFormData(f => ({ ...f, email: e.target.value }))}
          />
          <Select
            label="Formule"
            options={[
              { value: 'essentialiel', label: 'Essentiel' },
              { value: 'pro', label: 'Pro' },
              { value: 'business', label: 'Business' },
              { value: 'institution', label: 'Institution' },
            ]}
            placeholder="Sélectionner une formule"
            required
            value={formData.subscriptionPlan ?? ''}
            onChange={(value) => setFormData(f => ({ ...f, subscriptionPlan: value }))}
          />
        </div>

        <ModalFooter>
          <Button variant="outline" onClick={() => setShowCreateModal(false)}>
            Annuler
          </Button>
          <Button
            variant="primary"
            onClick={handleCreate}
            disabled={createOrg.isPending}
          >
            {createOrg.isPending ? 'Création...' : 'Créer'}
          </Button>
        </ModalFooter>
      </Modal>

      {/* Edit Modal */}
      <Modal
        open={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Modifier l'organisation"
        size="lg"
      >
        <div className="space-y-4">
          <Input
            label="Nom de l'organisation"
            placeholder="Ex: Restaurant Le Gourmet"
            required
            value={editData.name ?? ''}
            onChange={(e) => setEditData(d => ({ ...d, name: e.target.value }))}
          />
          <Select
            label="Formule"
            options={[
              { value: 'essentialiel', label: 'Essentiel' },
              { value: 'pro', label: 'Pro' },
              { value: 'business', label: 'Business' },
              { value: 'institution', label: 'Institution' },
            ]}
            placeholder="Sélectionner une formule"
            required
            value={editData.subscriptionPlan ?? ''}
            onChange={(value) => setEditData(d => ({ ...d, subscriptionPlan: value }))}
          />
          <Select
            label="Statut"
            options={[
              { value: 'active', label: 'Actif' },
              { value: 'trial', label: 'Essai' },
              { value: 'suspended', label: 'Suspendu' },
              { value: 'expired', label: 'Expiré' },
            ]}
            placeholder="Sélectionner un statut"
            required
            value={editData.subscriptionStatus ?? ''}
            onChange={(value) => setEditData(d => ({ ...d, subscriptionStatus: value }))}
          />
        </div>

        <ModalFooter>
          <Button variant="outline" onClick={() => setShowEditModal(false)}>
            Annuler
          </Button>
          <Button
            variant="primary"
            onClick={handleUpdate}
            disabled={updateOrg.isPending}
          >
            {updateOrg.isPending ? 'Enregistrement...' : 'Enregistrer'}
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
