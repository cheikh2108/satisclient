import { apiClient } from "./client";

export interface BillingCheckout {
  paymentId: string;
  reference: string;
  paymentUrl: string;
  amount: number;
  currency: string;
}

export interface CampaignCheckout extends BillingCheckout {
  campaigns: number;
}

export interface PlatformCampaignStats {
  overview: {
    revenue: number;
    successfulPayments: number;
    packsSold: number;
    purchasedCredits: number;
    remainingCredits: number;
    consumedCredits: number;
    activePacks: number;
    expiringPacks: number;
  };
  byPackage: Array<{
    code: string;
    label: string;
    revenue: number;
    packs: number;
    campaigns: number;
  }>;
  byOrganization: Array<{
    id: string;
    name: string;
    packs: number;
    purchased: number;
    remaining: number;
    consumed: number;
    surveys: number;
  }>;
}

export const billingApi = {
  createCheckout: async (): Promise<BillingCheckout> => {
    const { data } = await apiClient.post<BillingCheckout>("/billing/checkout");
    return data;
  },

  createCampaignCheckout: async (
    packageCode: string,
  ): Promise<CampaignCheckout> => {
    const { data } = await apiClient.post<CampaignCheckout>(
      "/billing/campaign-checkout",
      { packageCode },
    );
    return data;
  },

  getPlatformCampaignStats: async (): Promise<PlatformCampaignStats> => {
    const { data } = await apiClient.get<PlatformCampaignStats>(
      "/billing/platform-campaign-stats",
    );
    return data;
  },
};
