'use client';

import { useState } from 'react';
import { useUserStats } from '@/hooks';
import { Table } from '@/components/ui/table';
import { Modal, ModalFooter } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/components/ui/toast';
import { Shield, Plus, Eye, Edit, Trash2, Users } from 'lucide-react';

interface Role {
  id: string;
  name: string;
  description: string;
  usersCount: number;
  permissions: string[];
  isSystem: boolean;
  createdAt: string;
}

const mockRoles: Role[] = [
  {
    id: 'org_admin',
    name: 'Admin Organisation',
    description: 'Administrateur d\'une organisation cliente — gestion complète de l\'organisation',
    usersCount: 0,
    permissions: ['feedbacks.read','feedbacks.write','complaints.read','complaints.write','sites.read','sites.write','users.read','users.write','reports.read','reports.generate','settings.read','settings.write'],
    isSystem: true,
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'quality_manager',
    name: 'Responsable Qualité',
    description: 'Analyse les feedbacks, réclamations et génère des rapports qualité',
    usersCount: 0,
    permissions: ['feedbacks.read', 'feedbacks.write', 'complaints.read', 'reports.read', 'analytics.read'],
    isSystem: true,
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'service_manager',
    name: 'Responsable Service',
    description: 'Gère les réclamations et les équipes de son service',
    usersCount: 0,
    permissions: ['feedbacks.read', 'complaints.read', 'complaints.write', 'sites.read', 'users.read'],
    isSystem: true,
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'agent',
    name: 'Agent',
    description: 'Traite les réclamations et saisit les feedbacks clients',
    usersCount: 0,
    permissions: ['feedbacks.read', 'feedbacks.write', 'complaints.read', 'complaints.write'],
    isSystem: true,
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'client',
    name: 'Client',
    description: 'Client enregistré — peut soumettre des feedbacks et suivre ses réclamations',
    usersCount: 0,
    permissions: ['feedbacks.read'],
    isSystem: true,
    createdAt: '2024-01-01T00:00:00Z',
  },
];

// super_admin est un rôle plateforme, pas un rôle d'organisation
const SYSTEM_ROLES = ['org_admin', 'quality_manager', 'service_manager', 'agent', 'client'];

const availablePermissions = [
  { id: 'feedbacks.read', label: 'Voir les feedbacks', category: 'Feedbacks' },
  { id: 'feedbacks.write', label: 'Gérer les feedbacks', category: 'Feedbacks' },
  { id: 'complaints.read', label: 'Voir les réclamations', category: 'Réclamations' },
  { id: 'complaints.write', label: 'Gérer les réclamations', category: 'Réclamations' },
  { id: 'sites.read', label: 'Voir les sites', category: 'Sites' },
  { id: 'sites.write', label: 'Gérer les sites', category: 'Sites' },
  { id: 'users.read', label: 'Voir les utilisateurs', category: 'Utilisateurs' },
  { id: 'users.write', label: 'Gérer les utilisateurs', category: 'Utilisateurs' },
  { id: 'reports.read', label: 'Voir les rapports', category: 'Rapports' },
  { id: 'reports.generate', label: 'Générer des rapports', category: 'Rapports' },
  { id: 'settings.read', label: 'Voir les paramètres', category: 'Paramètres' },
  { id: 'settings.write', label: 'Modifier les paramètres', category: 'Paramètres' },
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

export default function RolesPage() {
  const { data: userStats } = useUserStats();

  // Enrichir les rôles avec le vrai comptage depuis les stats
  const rolesWithCount = mockRoles.map(r => ({
    ...r,
    usersCount: (userStats as any)?.byRole?.[r.id] ?? 0,
  }));
  const [roles, setRoles] = useState<Role[]>(mockRoles);
  const enrichedRoles = roles.map(r => ({
    ...r,
    usersCount: (userStats as any)?.byRole?.[r.id] ?? 0,
  }));
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const { addToast } = useToast();

  const handleDelete = (id: string, isSystem: boolean) => {
    if (isSystem) {
      addToast({ type: 'error', title: 'Impossible de supprimer un rôle système' });
      return;
    }
    if (confirm('Êtes-vous sûr de vouloir supprimer ce rôle ?')) {
      setRoles(roles.filter(r => r.id !== id));
      addToast({ type: 'success', title: 'Rôle supprimé' });
    }
  };

  const groupedPermissions = availablePermissions.reduce((acc, perm) => {
    if (!acc[perm.category]) acc[perm.category] = [];
    acc[perm.category].push(perm);
    return acc;
  }, {} as Record<string, typeof availablePermissions>);

  const columns = [
    {
      key: 'name',
      label: 'RÔLE',
      sortable: true,
      render: (role: Role) => (
        <div>
          <p className="font-medium text-slate-900 dark:text-white flex items-center gap-2">
            {role.name}
            {role.isSystem && (
              <span className="text-xs px-2 py-0.5 rounded bg-slate-100 dark:bg-[#1a1a1a] text-slate-600 dark:text-slate-400">
                Système
              </span>
            )}
          </p>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">{role.description}</p>
        </div>
      ),
    },
    {
      key: 'usersCount',
      label: 'UTILISATEURS',
      sortable: true,
      render: (role: Role) => (
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-slate-400" />
          <span className="font-semibold text-slate-900 dark:text-white tabular-nums">
            {role.usersCount}
          </span>
        </div>
      ),
    },
    {
      key: 'permissions',
      label: 'PERMISSIONS',
      render: (role: Role) => (
        <span className="text-sm text-slate-600 dark:text-slate-400">
          {role.permissions[0] === 'all' ? 'Toutes' : `${role.permissions.length} permissions`}
        </span>
      ),
    },
    {
      key: 'createdAt',
      label: 'CRÉÉ LE',
      render: (role: Role) => (
        <span className="text-sm text-slate-600 dark:text-slate-400">
          {new Date(role.createdAt).toLocaleDateString('fr-FR')}
        </span>
      ),
    },
    {
      key: 'actions',
      label: '',
      render: (role: Role) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setSelectedRole(role);
              setShowDetailModal(true);
            }}
            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-[#1a1a1a] transition-colors"
          >
            <Eye className="h-4 w-4 text-slate-600 dark:text-slate-400" />
          </button>
          <button
            onClick={() => {
              setSelectedRole(role);
              setSelectedPermissions(role.permissions);
              setShowEditModal(true);
            }}
            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-[#1a1a1a] transition-colors"
            disabled={role.isSystem}
          >
            <Edit className="h-4 w-4 text-slate-600 dark:text-slate-400" />
          </button>
          <button
            onClick={() => handleDelete(role.id, role.isSystem)}
            className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={role.isSystem}
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
            Rôles & Permissions
          </h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Gérez les rôles et leurs permissions
          </p>
        </div>
        <button
          onClick={() => {
            setSelectedPermissions([]);
            setShowCreateModal(true);
          }}
          className="flex items-center gap-2 rounded-xl bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 active:scale-95 transition-all shadow-sm"
        >
          <Plus className="h-4 w-4" />
          <span className="hidden xs:inline">Nouveau rôle</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Rôles système" value={SYSTEM_ROLES.length.toString()} change="—" isPositive />
        <StatCard label="Total Permissions" value={availablePermissions.length.toString()} change="—" isPositive />
        <StatCard label="Utilisateurs actifs" value={(userStats?.active ?? 0).toString()} change={(userStats?.total??0)>0 ? `${Math.round(((userStats?.active??0)/(userStats?.total??1))*100)}%` : '—'} isPositive />
        <StatCard label="Administrateurs" value={(userStats?.admins ?? 0).toString()} change={(userStats?.total??0)>0 ? `${Math.round(((userStats?.admins??0)/(userStats?.total??1))*100)}%` : '—'} isPositive />
      </div>

      {/* Table */}
      <Table
        data={enrichedRoles}
        columns={columns}
        pagination={{
          page,
          pageSize: 10,
          total: roles.length,
          onPageChange: setPage,
        }}
        sortable
      />

      {/* Detail Modal */}
      {selectedRole && (
        <Modal
          open={showDetailModal}
          onClose={() => setShowDetailModal(false)}
          title="Détails du rôle"
          size="lg"
        >
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="h-16 w-16 rounded-xl bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center flex-shrink-0">
                <Shield className="h-8 w-8 text-primary-600 dark:text-primary-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                  {selectedRole.name}
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                  {selectedRole.description}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Utilisateurs
                </label>
                <p className="text-slate-900 dark:text-white font-semibold">{selectedRole.usersCount}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Type
                </label>
                <p className="text-slate-900 dark:text-white">
                  {selectedRole.isSystem ? 'Rôle système' : 'Rôle personnalisé'}
                </p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                Permissions
              </label>
              <div className="rounded-lg bg-slate-50 dark:bg-[#0f0f0f] p-4 border border-slate-200 dark:border-slate-800/60">
                {selectedRole.permissions[0] === 'all' ? (
                  <p className="text-sm text-slate-900 dark:text-white font-medium">
                    ✓ Toutes les permissions
                  </p>
                ) : (
                  <div className="space-y-2">
                    {selectedRole.permissions.map(perm => {
                      const permission = availablePermissions.find(p => p.id === perm);
                      return permission ? (
                        <p key={perm} className="text-sm text-slate-900 dark:text-white">
                          ✓ {permission.label}
                        </p>
                      ) : null;
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>

          <ModalFooter>
            <Button variant="outline" onClick={() => setShowDetailModal(false)}>
              Fermer
            </Button>
            {!selectedRole.isSystem && (
              <Button variant="primary" onClick={() => {
                setShowDetailModal(false);
                setSelectedPermissions(selectedRole.permissions);
                setShowEditModal(true);
              }}>
                Modifier
              </Button>
            )}
          </ModalFooter>
        </Modal>
      )}

      {/* Create/Edit Modal */}
      <Modal
        open={showCreateModal || showEditModal}
        onClose={() => {
          setShowCreateModal(false);
          setShowEditModal(false);
        }}
        title={showEditModal ? 'Modifier le rôle' : 'Nouveau rôle'}
        size="lg"
      >
        <div className="space-y-6">
          <Input label="Nom du rôle" placeholder="Ex: Chef d'équipe" required />

          <Textarea
            label="Description"
            placeholder="Décrivez les responsabilités de ce rôle..."
            rows={3}
            required
          />

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
              Permissions
            </label>
            <div className="space-y-4">
              {Object.entries(groupedPermissions).map(([category, perms]) => (
                <div key={category}>
                  <p className="text-sm font-medium text-slate-900 dark:text-white mb-2">
                    {category}
                  </p>
                  <div className="space-y-2 pl-4">
                    {perms.map(perm => (
                      <label key={perm.id} className="flex items-center gap-2 cursor-pointer">
                        <Checkbox
                          checked={selectedPermissions.includes(perm.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedPermissions([...selectedPermissions, perm.id]);
                            } else {
                              setSelectedPermissions(selectedPermissions.filter(p => p !== perm.id));
                            }
                          }}
                        />
                        <span className="text-sm text-slate-700 dark:text-slate-300">
                          {perm.label}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <ModalFooter>
          <Button variant="outline" onClick={() => {
            setShowCreateModal(false);
            setShowEditModal(false);
          }}>
            Annuler
          </Button>
          <Button variant="primary" onClick={() => {
            addToast({ type: 'success', title: showEditModal ? 'Rôle modifié' : 'Rôle créé' });
            setShowCreateModal(false);
            setShowEditModal(false);
          }}>
            {showEditModal ? 'Enregistrer' : 'Créer'}
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
