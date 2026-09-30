import { apiClient } from "./client";

export interface BillingCheckout {
  paymentId: string;
  reference: string;
  paymentUrl: string;
  amount: number;
  currency: string;
}

export const billingApi = {
  createCheckout: async (): Promise<BillingCheckout> => {
    const { data } = await apiClient.post<BillingCheckout>("/billing/checkout");
    return data;
  },
};
