"use client";

import { useState } from "react";
import { Eye, Pencil, Plus, Shield, Trash2, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Modal, ModalFooter } from "@/components/ui/modal";
import { Table } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/toast";
import {
  useCreateRole,
  useDeleteRole,
  useRoles,
  useUpdateRole,
  useUserStats,
} from "@/hooks";
import type { Role } from "@/lib/api/roles";

const availablePermissions = [
  { id: "feedbacks.read", label: "Voir les feedbacks", category: "Feedbacks" },
  {
    id: "feedbacks.write",
    label: "Gérer les feedbacks",
    category: "Feedbacks",
  },
  {
    id: "complaints.read",
    label: "Voir les réclamations",
    category: "Réclamations",
  },
  {
    id: "complaints.write",
    label: "Gérer les réclamations",
    category: "Réclamations",
  },
  {
    id: "sites.read",
    label: "Voir les établissements",
    category: "Établissements",
  },
  {
    id: "sites.write",
    label: "Gérer les établissements",
    category: "Établissements",
  },
  {
    id: "users.read",
    label: "Voir les utilisateurs",
    category: "Utilisateurs",
  },
  {
    id: "users.write",
    label: "Gérer les utilisateurs",
    category: "Utilisateurs",
  },
  { id: "reports.read", label: "Voir les rapports", category: "Rapports" },
  {
    id: "reports.generate",
    label: "Générer des rapports",
    category: "Rapports",
  },
  { id: "settings.read", label: "Voir les paramètres", category: "Paramètres" },
  {
    id: "settings.write",
    label: "Modifier les paramètres",
    category: "Paramètres",
  },
];

const groupedPermissions = availablePermissions.reduce(
  (groups, permission) => {
    (groups[permission.category] ||= []).push(permission);
    return groups;
  },
  {} as Record<string, typeof availablePermissions>,
);

export default function RolesPage() {
  const { data: roles = [], isLoading } = useRoles();
  const { data: userStats } = useUserStats();
  const createRole = useCreateRole();
  const updateRole = useUpdateRole();
  const deleteRole = useDeleteRole();
  const { addToast } = useToast();
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [editorOpen, setEditorOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [permissions, setPermissions] = useState<string[]>([]);
  const [page, setPage] = useState(1);

  const openCreate = () => {
    setSelectedRole(null);
    setName("");
    setDescription("");
    setPermissions([]);
    setEditorOpen(true);
  };
  const openEdit = (role: Role) => {
    if (role.isSystem) return;
    setSelectedRole(role);
    setName(role.name);
    setDescription(role.description);
    setPermissions(role.permissions);
    setEditorOpen(true);
  };

  const saveRole = () => {
    if (!name.trim() || !description.trim()) {
      addToast({ type: "error", title: "Informations incomplètes" });
      return;
    }
    const payload = {
      name: name.trim(),
      description: description.trim(),
      permissions,
    };
    if (selectedRole)
      updateRole.mutate(
        { id: selectedRole.id, payload },
        { onSuccess: () => setEditorOpen(false) },
      );
    else createRole.mutate(payload, { onSuccess: () => setEditorOpen(false) });
  };

  const handleDelete = (role: Role) => {
    if (
      !role.isSystem &&
      window.confirm(`Supprimer le rôle « ${role.name} » ?`)
    )
      deleteRole.mutate(role.id);
  };

  const rolesWithCounts = roles.map((role) => ({
    ...role,
    usersCount: (userStats as any)?.byRole?.[role.id] ?? role.usersCount ?? 0,
  }));
  const columns = [
    {
      key: "name",
      label: "RÔLE",
      sortable: true,
      render: (role: Role) => (
        <div>
          <p className="font-medium text-slate-900 dark:text-white">
            {role.name}{" "}
            {role.isSystem && (
              <span className="ml-2 rounded bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
                Système
              </span>
            )}
          </p>
          <p className="mt-0.5 text-xs text-slate-500">{role.description}</p>
        </div>
      ),
    },
    {
      key: "usersCount",
      label: "UTILISATEURS",
      sortable: true,
      render: (role: Role) => (
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-slate-400" />
          {role.usersCount}
        </div>
      ),
    },
    {
      key: "permissions",
      label: "PERMISSIONS",
      render: (role: Role) => (
        <span className="text-sm text-slate-500">
          {role.permissions.includes("all")
            ? "Toutes"
            : `${role.permissions.length} permissions`}
        </span>
      ),
    },
    {
      key: "actions",
      label: "",
      render: (role: Role) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setSelectedRole(role);
              setDetailOpen(true);
            }}
            className="rounded-lg p-1.5 hover:bg-slate-100"
          >
            <Eye className="h-4 w-4" />
          </button>
          <button
            onClick={() => openEdit(role)}
            disabled={role.isSystem}
            className="rounded-lg p-1.5 hover:bg-slate-100 disabled:opacity-40"
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            onClick={() => handleDelete(role)}
            disabled={role.isSystem}
            className="rounded-lg p-1.5 text-red-600 hover:bg-red-50 disabled:opacity-40"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Rôles & Permissions
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Gérez les rôles personnalisés de votre organisation.
          </p>
        </div>
        <Button variant="primary" onClick={openCreate}>
          <Plus className="mr-2 h-4 w-4" /> Nouveau rôle
        </Button>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 p-5 dark:border-slate-800">
          <p className="text-xs uppercase text-slate-500">Rôles</p>
          <p className="mt-2 text-3xl font-bold">{roles.length}</p>
        </div>
        <div className="rounded-xl border border-slate-200 p-5 dark:border-slate-800">
          <p className="text-xs uppercase text-slate-500">
            Permissions disponibles
          </p>
          <p className="mt-2 text-3xl font-bold">
            {availablePermissions.length}
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 p-5 dark:border-slate-800">
          <p className="text-xs uppercase text-slate-500">
            Utilisateurs actifs
          </p>
          <p className="mt-2 text-3xl font-bold">{userStats?.active ?? 0}</p>
        </div>
      </div>
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-800/60 dark:bg-[#111111]">
        {isLoading ? (
          <p className="p-8 text-sm text-slate-500">Chargement des rôles...</p>
        ) : (
          <Table
            data={rolesWithCounts}
            columns={columns}
            pagination={{
              page,
              pageSize: 10,
              total: rolesWithCounts.length,
              onPageChange: setPage,
            }}
            sortable
          />
        )}
      </div>

      <Modal
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        title="Détails du rôle"
        size="lg"
      >
        {selectedRole && (
          <div className="space-y-5">
            <div className="flex items-start gap-3">
              <Shield className="h-8 w-8 text-primary-600" />
              <div>
                <h2 className="font-semibold">{selectedRole.name}</h2>
                <p className="text-sm text-slate-500">
                  {selectedRole.description}
                </p>
              </div>
            </div>
            <div>
              <p className="mb-2 text-sm font-medium">Permissions</p>
              <div className="space-y-1">
                {selectedRole.permissions.includes("all") ? (
                  <p className="text-sm">Toutes les permissions</p>
                ) : (
                  selectedRole.permissions.map((permission) => (
                    <p key={permission} className="text-sm">
                      {permission}
                    </p>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
        <ModalFooter>
          <Button variant="outline" onClick={() => setDetailOpen(false)}>
            Fermer
          </Button>
        </ModalFooter>
      </Modal>

      <Modal
        open={editorOpen}
        onClose={() => setEditorOpen(false)}
        title={selectedRole ? "Modifier le rôle" : "Nouveau rôle"}
        size="lg"
      >
        <div className="space-y-5">
          <Input
            label="Nom du rôle"
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
          />
          <Textarea
            label="Description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            rows={3}
            required
          />
          <div>
            <p className="mb-3 text-sm font-medium">Permissions</p>
            <div className="space-y-4">
              {Object.entries(groupedPermissions).map(
                ([category, categoryPermissions]) => (
                  <div key={category}>
                    <p className="mb-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                      {category}
                    </p>
                    <div className="space-y-2 pl-2">
                      {categoryPermissions.map((permission) => (
                        <label
                          key={permission.id}
                          className="flex items-center gap-2 text-sm"
                        >
                          <Checkbox
                            checked={permissions.includes(permission.id)}
                            onChange={(event) =>
                              setPermissions((current) =>
                                event.target.checked
                                  ? [...current, permission.id]
                                  : current.filter(
                                      (item) => item !== permission.id,
                                    ),
                              )
                            }
                          />
                          {permission.label}
                        </label>
                      ))}
                    </div>
                  </div>
                ),
              )}
            </div>
          </div>
        </div>
        <ModalFooter>
          <Button variant="outline" onClick={() => setEditorOpen(false)}>
            Annuler
          </Button>
          <Button
            variant="primary"
            onClick={saveRole}
            disabled={createRole.isPending || updateRole.isPending}
          >
            {createRole.isPending || updateRole.isPending
              ? "Enregistrement..."
              : "Enregistrer"}
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
