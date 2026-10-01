import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { filesApi } from "@/lib/api/files";
import { useToast } from "@/components/ui/toast";

export const useUploadFile = () => {
  const queryClient = useQueryClient();
  const { addToast } = useToast();
  return useMutation({
    mutationFn: ({
      file,
      metadata,
    }: {
      file: File;
      metadata?: { name?: string; category?: string };
    }) => filesApi.upload(file, metadata),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["files"] });
      addToast({ type: "success", title: "Fichier uploadé avec succès" });
    },
    onError: () =>
      addToast({
        type: "error",
        title: "Erreur",
        description: "Impossible d'uploader le fichier",
      }),
  });
};

export const useFiles = () =>
  useQuery({
    queryKey: ["files"],
    queryFn: () => filesApi.list(),
  });

export const useDeleteFile = () => {
  const queryClient = useQueryClient();
  const { addToast } = useToast();
  return useMutation({
    mutationFn: (id: string) => filesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["files"] });
      addToast({ type: "success", title: "Fichier supprimé" });
    },
    onError: () =>
      addToast({
        type: "error",
        title: "Erreur",
        description: "Impossible de supprimer le fichier",
      }),
  });
};
