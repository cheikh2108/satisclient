import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { rolesApi, type RolePayload } from "@/lib/api/roles";
import { useToast } from "@/components/ui/toast";

export const roleKeys = { all: ["roles"] as const };

export const useRoles = () =>
  useQuery({ queryKey: roleKeys.all, queryFn: rolesApi.list });

export const useCreateRole = () => {
  const queryClient = useQueryClient();
  const { addToast } = useToast();
  return useMutation({
    mutationFn: (payload: RolePayload) => rolesApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: roleKeys.all });
      addToast({ type: "success", title: "Rôle créé" });
    },
    onError: () =>
      addToast({
        type: "error",
        title: "Création impossible",
        description: "Vérifiez le nom et les permissions du rôle.",
      }),
  });
};

export const useUpdateRole = () => {
  const queryClient = useQueryClient();
  const { addToast } = useToast();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: Partial<RolePayload>;
    }) => rolesApi.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: roleKeys.all });
      addToast({ type: "success", title: "Rôle modifié" });
    },
    onError: () =>
      addToast({ type: "error", title: "Modification impossible" }),
  });
};

export const useDeleteRole = () => {
  const queryClient = useQueryClient();
  const { addToast } = useToast();
  return useMutation({
    mutationFn: (id: string) => rolesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: roleKeys.all });
      addToast({ type: "success", title: "Rôle supprimé" });
    },
    onError: () => addToast({ type: "error", title: "Suppression impossible" }),
  });
};
