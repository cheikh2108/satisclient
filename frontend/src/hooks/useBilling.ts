import { useMutation } from "@tanstack/react-query";
import { billingApi } from "@/lib/api/billing";
import { useToast } from "@/components/ui/toast";

export const useCreateBillingCheckout = () => {
  const { addToast } = useToast();

  return useMutation({
    mutationFn: () => billingApi.createCheckout(),
    onSuccess: ({ paymentUrl }) => {
      window.location.assign(paymentUrl);
    },
    onError: () => {
      addToast({
        type: "error",
        title: "Paiement indisponible",
        description: "Impossible de créer la session DexPay.",
      });
    },
  });
};

export const useCreateCampaignCheckout = () => {
  const { addToast } = useToast();

  return useMutation({
    mutationFn: (packageCode: string) =>
      billingApi.createCampaignCheckout(packageCode),
    onSuccess: ({ paymentUrl }) => window.location.assign(paymentUrl),
    onError: () =>
      addToast({
        type: "error",
        title: "Paiement indisponible",
        description:
          "Impossible de créer la session DexPay pour cette campagne.",
      }),
  });
};
