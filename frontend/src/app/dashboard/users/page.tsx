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
import { useUsers, useUserStats, useDeleteUser, useCreateUser, useUpdateUser, useCurrentUser, useOrganization } from '@/hooks';
import { getErrorMessage } from '@/lib/api/client';
import type { User, UserFilters } from '@/types/api';
import { Users as UsersIcon, Plus, Eye, Edit, Trash2, Mail, Phone, Shield } from 'lucide-react';
import { SkeletonTable } from '@/components/ui/skeleton';

const userSchema = z.object({
  firstName: z.string().min(2, 'Minimum 2 caractères'),
  lastName: z.string().min(2, 'Minimum 2 caractères'),
  email: z.string().email('Email invalide'),
  role: z.enum(['super_admin', 'org_admin', 'quality_manager', 'service_manager', 'agent', 'client']),
  status: z.enum(['active', 'inactive', 'pending', 'suspended']),
  password: z.string().min(8, 'Minimum 8 caractères').optional(),
});

type UserFormValues = z.infer<typeof userSchema>;

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

export default function UsersPage() {
  const [filters, setFilters] = useState<UserFilters>({ page: 1, pageSize: 10 });
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
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
  } = useForm<UserFormValues>({
    resolver: zodResolver(userSchema),
    defaultValues: { role: 'agent', status: 'active' },
  });

  const { data: currentUser } = useCurrentUser();
  const { data: userOrg } = useOrganization((selectedUser as any)?.organizationId ?? '');
  const isSuperAdmin = (currentUser as any)?.role === 'super_admin';

  // Super admin : voir uniquement les org_admin (contact principal de chaque org cliente)
  const effectiveFilters = isSuperAdmin ? { ...filters, role: 'org_admin' } : filters;

  // Hooks API
  const { data: usersData, isLoading, error } = useUsers(effectiveFilters as any);
  const { data: stats } = useUserStats();
  const deleteUser = useDeleteUser();
  const createUser = useCreateUser();
  const updateUser = useUpdateUser();

  const users = usersData?.data || [];

  const usersThisMonth = (usersData?.data || []).filter(u =>
    new Date(u.createdAt).getMonth() === new Date().getMonth() &&
    new Date(u.createdAt).getFullYear() === new Date().getFullYear()
  ).length;
  const changeStr = usersThisMonth > 0 ? `+${usersThisMonth} ce mois` : '—';

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'super_admin': return 'Super Admin';
      case 'org_admin': return 'Admin Organisation';
      case 'quality_manager': return 'Resp. Qualité';
      case 'service_manager': return 'Resp. Service';
      case 'agent': return 'Agent';
      case 'client': return 'Client';
      default: return role;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'super_admin': return 'text-red-600 dark:text-red-400';
      case 'org_admin': return 'text-primary-600 dark:text-primary-400';
      case 'quality_manager': return 'text-purple-600 dark:text-purple-400';
      case 'service_manager': return 'text-blue-600 dark:text-blue-400';
      case 'agent': return 'text-amber-600 dark:text-amber-400';
      case 'client': return 'text-slate-600 dark:text-slate-400';
      default: return '';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-primary-600 dark:text-primary-400';
      case 'inactive': return 'text-slate-500 dark:text-slate-500';
      case 'pending': return 'text-amber-600 dark:text-amber-400';
      case 'suspended': return 'text-red-600 dark:text-red-400';
      default: return '';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active': return 'Actif';
      case 'inactive': return 'Inactif';
      case 'pending': return 'En attente';
      case 'suspended': return 'Suspendu';
      default: return status || '—';
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
      deleteUser.mutate(id);
    }
  };

  const onSubmit = handleSubmit(async (data) => {
    if (selectedUser) {
      await updateUser.mutateAsync({ id: selectedUser.id, data });
    } else {
      await createUser.mutateAsync({ ...data, password: data.password || 'ChangeMe123!', organizationId: currentUser?.organizationId ?? '' });
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
      label: 'UTILISATEUR',
      sortable: true,
      render: (user: User) => (
        <div>
          <p className="font-medium text-slate-900 dark:text-white">
            {user.firstName} {user.lastName}
          </p>
          <p className="text-xs text-slate-600 dark:text-slate-400">{user.email}</p>
        </div>
      ),
    },
    {
      key: 'role',
      label: 'RÔLE',
      render: (user: User) => (
        <span className={`text-sm font-medium ${getRoleColor(user.role)}`}>
          {getRoleLabel(user.role)}
        </span>
      ),
    },
    {
      key: 'site',
      label: 'SITE',
      render: () => (
        <span className="text-sm text-slate-400 dark:text-slate-600">—</span>
      ),
    },
    {
      key: 'status',
      label: 'STATUT',
      render: (user: User) => (
        <span className={`text-sm font-medium ${getStatusColor(user.status)}`}>
          {getStatusLabel(user.status)}
        </span>
      ),
    },
    {
      key: 'lastLoginAt',
      label: 'DERNIÈRE CONNEXION',
      render: (user: User) => (
        <span className="text-sm text-slate-600 dark:text-slate-400">
          {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString('fr-FR') : 'Jamais'}
        </span>
      ),
    },
    {
      key: 'actions',
      label: '',
      render: (user: User) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setSelectedUser(user);
              setShowDetailModal(true);
            }}
            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-[#1a1a1a] transition-colors"
          >
            <Eye className="h-4 w-4 text-slate-600 dark:text-slate-400" />
          </button>
          <button
            onClick={() => {
              setSelectedUser(user);
              reset({
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                role: user.role as UserFormValues['role'],
                status: user.status as UserFormValues['status'],
              });
              setShowEditModal(true);
            }}
            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-[#1a1a1a] transition-colors"
          >
            <Edit className="h-4 w-4 text-slate-600 dark:text-slate-400" />
          </button>
          <button
            onClick={() => handleDelete(user.id)}
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
            Utilisateurs
          </h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            {(currentUser as any)?.role === 'super_admin'
              ? 'Utilisateurs de la plateforme SatisClient'
              : 'Gérez les utilisateurs de votre organisation'}
          </p>
        </div>
        {isSuperAdmin ? (
        <button
          onClick={() => {
            setSelectedUser(null);
            reset({ firstName: '', lastName: '', email: '', role: 'super_admin', status: 'active' });
            setShowCreateModal(true);
          }}
          className="flex items-center gap-2 rounded-xl bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 active:scale-95 transition-all shadow-sm"
        >
          <Plus className="h-4 w-4" />
          <span className="hidden xs:inline">Ajouter un admin</span>
        </button>
        ) : (
        <button
          onClick={() => {
            setSelectedUser(null);
            reset({ firstName: '', lastName: '', email: '', role: 'agent', status: 'active' });
            setShowCreateModal(true);
          }}
          className="flex items-center gap-2 rounded-xl bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 active:scale-95 transition-all shadow-sm"
        >
          <Plus className="h-4 w-4" />
          <span className="hidden xs:inline">Nouvel utilisateur</span>
        </button>
        )}
      </div>


      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Utilisateurs" value={(stats?.total ?? users.length).toString()} change={changeStr} isPositive />
        <StatCard label="Actifs" value={(stats?.active ?? users.filter(u => u.status === 'active').length).toString()} change={(stats?.total ?? 0) > 0 ? `${Math.round(((stats?.active ?? 0) / (stats?.total ?? 1)) * 100)}% du total` : '—'} isPositive />
        <StatCard label="En attente" value={(stats?.pending ?? users.filter(u => u.status === 'pending').length).toString()} change={(stats?.total??0)>0 ? `${Math.round(((stats?.pending??0)/(stats?.total??1))*100)}%` : '—'} isPositive={(stats?.pending ?? 0) === 0} />
        <StatCard label="Administrateurs" value={(stats?.admins ?? users.filter(u => u.role === 'super_admin' || u.role === 'org_admin').length).toString()} change={(stats?.total??0)>0 ? `${Math.round(((stats?.admins??0)/(stats?.total??1))*100)}%` : '—'} isPositive />
      </div>

      {/* Table */}
      {isLoading ? (
        <SkeletonTable />
      ) : users.length === 0 ? (
        <div className="text-center py-12 rounded-lg border border-slate-200 dark:border-slate-800/60 bg-slate-50 dark:bg-[#0f0f0f]">
          <p className="text-slate-600 dark:text-slate-400">Aucun utilisateur pour le moment</p>
        </div>
      ) : (
        <Table
          data={users}
          columns={columns}
          pagination={{
            page: filters.page || 1,
            pageSize: filters.pageSize || 10,
            total: usersData?.meta.total || 0,
            onPageChange: (newPage) => setFilters({ ...filters, page: newPage }),
          }}
          sortable
        />
      )}

      {/* Detail Modal */}
      {selectedUser && (
        <Modal
          open={showDetailModal}
          onClose={() => setShowDetailModal(false)}
          title="Détails de l'utilisateur"
          size="lg"
        >
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="h-16 w-16 rounded-xl bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center flex-shrink-0">
                <UsersIcon className="h-8 w-8 text-primary-600 dark:text-primary-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                  {selectedUser.firstName} {selectedUser.lastName}
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                  {getRoleLabel(selectedUser.role)}
                </p>
              </div>
              <span className={`text-sm font-medium px-3 py-1 rounded-lg bg-slate-50 dark:bg-[#1a1a1a] ${getStatusColor(selectedUser.status)}`}>
                {getStatusLabel(selectedUser.status)}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Email
                </label>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-slate-400" />
                  <p className="text-slate-900 dark:text-white">{selectedUser.email}</p>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Organisation
                </label>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-slate-400" />
                  <p className="text-slate-900 dark:text-white">{userOrg?.name || (selectedUser as any)?.organizationId || '—'}</p>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Membre depuis
                </label>
                <p className="text-slate-900 dark:text-white">{new Date(selectedUser.createdAt).toLocaleDateString('fr-FR')}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Dernière connexion
                </label>
                <p className="text-slate-900 dark:text-white">
                  {selectedUser.lastLoginAt ? new Date(selectedUser.lastLoginAt).toLocaleString('fr-FR') : 'Jamais'}
                </p>
              </div>
            </div>

            <div className="rounded-lg bg-slate-50 dark:bg-[#0f0f0f] p-4 border border-slate-200 dark:border-slate-800/60">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Permissions
                </span>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Cet utilisateur a le rôle <span className={`font-medium ${getRoleColor(selectedUser.role)}`}>
                  {getRoleLabel(selectedUser.role)}
                </span> et peut accéder aux fonctionnalités correspondantes.
              </p>
            </div>
          </div>

          <ModalFooter>
            <Button variant="outline" onClick={() => setShowDetailModal(false)}>
              Fermer
            </Button>
            <Button variant="primary" onClick={() => {
              reset({
                firstName: selectedUser.firstName,
                lastName: selectedUser.lastName,
                email: selectedUser.email,
                role: selectedUser.role as UserFormValues['role'],
                status: selectedUser.status as UserFormValues['status'],
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
        title={showEditModal ? 'Modifier l\'utilisateur' : 'Nouvel utilisateur'}
        size="lg"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Prénom"
              placeholder="Jean"
              required
              {...register('firstName')}
              error={errors.firstName?.message}
            />
            <Input
              label="Nom"
              placeholder="Dupont"
              required
              {...register('lastName')}
              error={errors.lastName?.message}
            />
          </div>

          <Input
            label="Email"
            type="email"
            placeholder="jean.dupont@example.com"
            required
            {...register('email')}
            error={errors.email?.message}
          />

          {!selectedUser && (
            <Input
              label="Mot de passe temporaire"
              type="password"
              placeholder="Minimum 8 caractères"
              {...register('password')}
              error={errors.password?.message}
            />
          )}

          <Select
            label="Rôle"
            options={isSuperAdmin
              ? [{ value: 'super_admin', label: 'Super Admin Plateforme' }]
              : [
                  { value: 'org_admin', label: 'Admin Organisation' },
                  { value: 'quality_manager', label: 'Resp. Qualité' },
                  { value: 'service_manager', label: 'Resp. Service' },
                  { value: 'agent', label: 'Agent' },
                  { value: 'client', label: 'Client' },
                ]
            }
            placeholder="Sélectionner un rôle"
            required
            value={watch('role')}
            onChange={(val) => setValue('role', val as UserFormValues['role'], { shouldValidate: true })}
            error={errors.role?.message}
            disabled={isSuperAdmin}
          />

          <Select
            label="Statut"
            options={[
              { value: 'active', label: 'Actif' },
              { value: 'inactive', label: 'Inactif' },
              { value: 'pending', label: 'En attente' },
              { value: 'suspended', label: 'Suspendu' },
            ]}
            placeholder="Sélectionner un statut"
            required
            value={watch('status')}
            onChange={(val) => setValue('status', val as UserFormValues['status'], { shouldValidate: true })}
            error={errors.status?.message}
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
