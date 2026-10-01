"use client";

import React, { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/components/ui/toast";
import {
  Settings as SettingsIcon,
  User,
  Building2,
  Bell,
  Shield,
  Palette,
  Globe,
  CreditCard,
} from "lucide-react";
import {
  useCurrentUser,
  useOrganization,
  useUpdateProfile,
  useUpdateOrganization,
  useUpdatePreferences,
  useNotificationPreferences,
  useUpdateNotificationPreferences,
  useOrgUsage,
  useCreateBillingCheckout,
  useCreateCampaignCheckout,
} from "@/hooks";

// ── Labels ──────────────────────────────────────────────────────────────────
const planLabels: Record<string, string> = {
  essentialiel: "Essentiel",
  pro: "Pro",
  business: "Business",
  institution: "Institution",
};

const statusLabels: Record<string, { label: string; color: string }> = {
  active: {
    label: "Actif",
    color: "text-green-600 bg-green-50 dark:bg-green-900/20",
  },
  trial: {
    label: "Essai gratuit",
    color: "text-amber-600 bg-amber-50 dark:bg-amber-900/20",
  },
  suspended: {
    label: "Suspendu",
    color: "text-red-600 bg-red-50 dark:bg-red-900/20",
  },
  expired: {
    label: "Expiré",
    color: "text-slate-600 bg-slate-100 dark:bg-slate-800",
  },
};

// ── QuotaBar ─────────────────────────────────────────────────────────────────
function QuotaBar({
  label,
  used,
  max,
}: {
  label: string;
  used: number;
  max: number;
}) {
  const pct = Math.min(Math.round((used / max) * 100), 100);
  const color =
    pct >= 90 ? "bg-red-500" : pct >= 70 ? "bg-amber-500" : "bg-[#3a5a40]";
  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="text-slate-700 dark:text-slate-300 font-medium">
          {label}
        </span>
        <span
          className={`font-semibold ${pct >= 90 ? "text-red-600" : "text-slate-600 dark:text-slate-400"}`}
        >
          {used} / {max}
        </span>
      </div>
      <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full ${color} transition-all`}
          style={{ width: `${pct}%` }}
        />
      </div>
      {pct >= 90 && (
        <p className="text-xs text-red-600 dark:text-red-400 mt-1">
          Quota presque atteint
        </p>
      )}
    </div>
  );
}

// ── SubscriptionTab ───────────────────────────────────────────────────────────
function SubscriptionTab({
  usage,
  isLoading,
}: {
  usage: any;
  isLoading: boolean;
}) {
  const createCheckout = useCreateBillingCheckout();
  const createCampaignCheckout = useCreateCampaignCheckout();
  if (isLoading) {
    return (
      <div className="max-w-2xl space-y-4 animate-pulse">
        <div className="h-20 bg-slate-100 dark:bg-slate-800 rounded-xl" />
        <div className="h-40 bg-slate-100 dark:bg-slate-800 rounded-xl" />
      </div>
    );
  }

  if (!usage) {
    return (
      <div className="max-w-2xl">
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Impossible de charger les données d'abonnement.
        </p>
      </div>
    );
  }

  const planLabel = planLabels[usage.plan] ?? usage.plan;
  const statusInfo = statusLabels[usage.status] ?? {
    label: usage.status,
    color: "text-slate-600 bg-slate-100",
  };
  const isTrial = usage.status === "trial";

  const upgradeSubject = encodeURIComponent(
    `Demande d'upgrade — plan ${planLabel}`,
  );
  const upgradeHref = `mailto:contact@satisclient.sn?subject=${upgradeSubject}`;

  return (
    <div className="max-w-2xl space-y-6">
      {/* Plan actuel */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800/60 p-5 space-y-3">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
          Plan actuel
        </h2>
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-2xl font-bold text-slate-900 dark:text-white">
            {planLabel}
          </span>
          <span
            className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusInfo.color}`}
          >
            {statusInfo.label}
          </span>
        </div>
        {usage.subscriptionEndsAt && (
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Valide jusqu'au{" "}
            <span className="font-medium text-slate-700 dark:text-slate-300">
              {new Date(usage.subscriptionEndsAt).toLocaleDateString("fr-FR", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </span>
          </p>
        )}
      </div>

      {/* Bandeau trial */}
      {isTrial && (
        <div className="rounded-xl border border-amber-200 dark:border-amber-800/40 bg-amber-50 dark:bg-amber-900/10 p-4 flex items-center gap-3">
          <CreditCard className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0" />
          <p className="text-sm text-amber-700 dark:text-amber-300 font-medium">
            {usage.daysRemainingTrial != null
              ? usage.daysRemainingTrial > 0
                ? `${usage.daysRemainingTrial} jour${usage.daysRemainingTrial > 1 ? "s" : ""} restant${usage.daysRemainingTrial > 1 ? "s" : ""} dans votre essai gratuit`
                : "Votre essai gratuit est terminé"
              : "Essai gratuit en cours"}
          </p>
        </div>
      )}

      {/* Quotas */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800/60 p-5 space-y-5">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
          Utilisation des quotas
        </h2>
        <QuotaBar
          label="Établissements"
          used={usage.limits.sites.used}
          max={usage.limits.sites.max}
        />
        <QuotaBar
          label="Utilisateurs"
          used={usage.limits.users.used}
          max={usage.limits.users.max}
        />
        <QuotaBar
          label="Feedbacks ce mois-ci"
          used={usage.limits.feedbacksThisMonth.used}
          max={usage.limits.feedbacksThisMonth.max}
        />
      </div>

      {/* CTA upgrade */}
      {(usage.plan === "essentialiel" || usage.plan === "pro" || isTrial) && (
        <div className="rounded-xl border border-[#3a5a40]/30 bg-[#3a5a40]/5 dark:bg-[#3a5a40]/10 p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex-1">
            <p className="text-sm font-semibold text-slate-900 dark:text-white">
              {isTrial
                ? "Activez votre abonnement"
                : "Renouvelez votre abonnement"}
            </p>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
              Payez la formule {planLabel} et bénéficiez de 30 jours d'accès.
            </p>
          </div>
          {usage.plan === "essentialiel" || usage.plan === "pro" ? (
            <button
              type="button"
              onClick={() => createCheckout.mutate()}
              disabled={createCheckout.isPending}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#3a5a40] text-white text-sm font-medium hover:bg-[#2e4a33] transition-colors whitespace-nowrap disabled:opacity-60"
            >
              <CreditCard className="h-4 w-4" />
              {createCheckout.isPending
                ? "Préparation..."
                : isTrial
                  ? "Payer maintenant"
                  : "Renouveler l'abonnement"}
            </button>
          ) : (
            <a
              href={upgradeHref}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#3a5a40] text-white text-sm font-medium hover:bg-[#2e4a33] transition-colors whitespace-nowrap"
            >
              <CreditCard className="h-4 w-4" />
              Demander un devis
            </a>
          )}
        </div>
      )}

      <div className="rounded-xl border border-slate-200 dark:border-slate-800/60 p-5 space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
            Acheter une campagne
          </h2>
          <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
            Utilisez un pack pour créer des enquêtes ponctuelles sans abonnement
            supplémentaire.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { code: "single", label: "1 campagne", price: "75 000 FCFA" },
            {
              code: "frequency2",
              label: "2 campagnes/an",
              price: "130 000 FCFA",
            },
            {
              code: "frequency3",
              label: "3 campagnes/an",
              price: "180 000 FCFA",
            },
            {
              code: "frequency4",
              label: "4 campagnes/an",
              price: "220 000 FCFA",
            },
          ].map((pack) => (
            <button
              key={pack.code}
              type="button"
              onClick={() => createCampaignCheckout.mutate(pack.code)}
              disabled={createCampaignCheckout.isPending}
              className="rounded-lg border border-slate-200 p-3 text-left transition-colors hover:border-[#3a5a40] hover:bg-[#3a5a40]/5 disabled:opacity-60 dark:border-slate-800"
            >
              <span className="block text-sm font-semibold text-slate-900 dark:text-white">
                {pack.label}
              </span>
              <span className="mt-1 block text-xs text-slate-600 dark:text-slate-400">
                {pack.price}
              </span>
            </button>
          ))}
        </div>
        {usage.campaignPacks?.length > 0 && (
          <div className="border-t border-slate-200 pt-3 text-sm dark:border-slate-800">
            <p className="font-medium text-slate-900 dark:text-white">
              Crédits disponibles
            </p>
            <div className="mt-2 space-y-1 text-xs text-slate-600 dark:text-slate-400">
              {usage.campaignPacks.map((pack: any) => (
                <p key={pack.id}>
                  {pack.remaining} campagne(s) restante(s), valables
                  jusqu&apos;au{" "}
                  {new Date(pack.expiresAt).toLocaleDateString("fr-FR")}
                </p>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("profile");
  const { data: currentUser } = useCurrentUser();
  const { data: currentOrg } = useOrganization(
    currentUser?.organizationId ?? "",
  );
  const { data: orgUsage, isLoading: usageLoading } = useOrgUsage();
  const { addToast } = useToast();

  const [emailNotifications, setEmailNotifications] = useState(true);
  const [inAppNotifications, setInAppNotifications] = useState(true);
  const [eventPreferences, setEventPreferences] = useState<
    Record<string, boolean>
  >({
    feedbacks: true,
    complaints: true,
    qr_scans: true,
    reports: true,
    users: true,
  });
  const [twoFactorAuth, setTwoFactorAuth] = useState(false);
  const { theme: currentTheme, setTheme } = useTheme();
  const [selectedTheme, setSelectedTheme] = useState("system");
  const [selectedLang, setSelectedLang] = useState("fr");
  const [selectedTz, setSelectedTz] = useState("Europe/Paris");
  const [selectedDateFormat, setSelectedDateFormat] = useState("DD/MM/YYYY");

  // Mutations API
  const updateProfile = useUpdateProfile();
  const updateOrg = useUpdateOrganization();
  const updatePrefs = useUpdatePreferences();
  const { data: notificationPreferences } = useNotificationPreferences();
  const updateNotificationPreferences = useUpdateNotificationPreferences();

  // Formulaire profil (React Hook Form)
  const profileForm = useForm({
    defaultValues: {
      firstName: currentUser?.firstName ?? "",
      lastName: currentUser?.lastName ?? "",
      email: currentUser?.email ?? "",
      phone: (currentUser as any)?.phone ?? "",
    },
  });

  useEffect(() => {
    if (currentTheme) setSelectedTheme(currentTheme);
  }, [currentTheme]);

  useEffect(() => {
    if (currentUser) {
      profileForm.reset({
        firstName: currentUser.firstName ?? "",
        lastName: currentUser.lastName ?? "",
        email: currentUser.email ?? "",
        phone: (currentUser as any)?.phone ?? "",
      });
      // Charger les préférences sauvegardées
      const prefs = (currentUser as any)?.preferences as
        Record<string, unknown> | undefined;
      if (prefs) {
        if (prefs.emailNotifications !== undefined)
          setEmailNotifications(prefs.emailNotifications as boolean);
        if (prefs.pushNotifications !== undefined)
          setInAppNotifications(prefs.pushNotifications as boolean);
        if (prefs.twoFactorEnabled !== undefined)
          setTwoFactorAuth(prefs.twoFactorEnabled as boolean);
        if (prefs.theme) {
          setSelectedTheme(prefs.theme as string);
        }
        if (prefs.locale) setSelectedLang(prefs.locale as string);
        if (prefs.timezone) setSelectedTz(prefs.timezone as string);
        if (prefs.dateFormat) setSelectedDateFormat(prefs.dateFormat as string);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser]);

  useEffect(() => {
    if (!notificationPreferences) return;
    setEmailNotifications(notificationPreferences.emailEnabled);
    setInAppNotifications(notificationPreferences.inAppEnabled);
    setEventPreferences((current) => ({
      ...current,
      ...notificationPreferences.eventPreferences,
    }));
  }, [notificationPreferences]);

  const onSaveProfile = profileForm.handleSubmit((data) => {
    updateProfile.mutate({
      firstName: data.firstName,
      lastName: data.lastName,
      phone: (data as any).phone || undefined,
    });
  });

  // Org name contrôlé
  const [orgName, setOrgName] = useState("");

  useEffect(() => {
    if (currentOrg) {
      setOrgName(currentOrg.name ?? "");
    }
  }, [currentOrg]);

  const handleSaveOrg = () => {
    if (!currentUser?.organizationId) return;
    updateOrg.mutate({
      id: currentUser.organizationId,
      data: { name: orgName },
    });
  };

  const handleSaveNotifications = () => {
    updateNotificationPreferences.mutate({
      emailEnabled: emailNotifications,
      smsEnabled: false,
      inAppEnabled: inAppNotifications,
      eventPreferences,
    });
  };

  const handleSaveSecurity = () => {
    // 2FA non implémenté — rien à sauvegarder pour l'instant
    addToast({
      type: "info",
      title: "Sécurité",
      description: "Aucune modification à enregistrer",
    });
  };

  const handleSaveAppearance = () => {
    setTheme(selectedTheme);
    updatePrefs.mutate({ theme: selectedTheme });
  };

  const isDirtyAppearance = selectedTheme !== (currentTheme ?? "system");

  const handleSaveLocalization = () => {
    updatePrefs.mutate({
      locale: selectedLang,
      timezone: selectedTz,
      dateFormat: selectedDateFormat,
    });
  };

  const tabs = [
    { id: "profile", label: "Profil", icon: User },
    { id: "organization", label: "Organisation", icon: Building2 },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "security", label: "Sécurité", icon: Shield },
    { id: "appearance", label: "Apparence", icon: Palette },
    { id: "localization", label: "Localisation", icon: Globe },
    { id: "subscription", label: "Abonnement", icon: CreditCard },
  ];

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl lg:text-[34px] font-bold text-slate-900 dark:text-white leading-tight">
          Paramètres
        </h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          Gérez les paramètres de votre compte et de votre organisation
        </p>
      </div>

      {/* Tabs Navigation */}
      <div className="border-b border-slate-200 dark:border-slate-800/60">
        <div className="flex gap-6 overflow-x-auto scrollbar-thin">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 pb-4 px-1 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? "border-primary-600 text-primary-600 dark:text-primary-400"
                    : "border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tabs Content */}
      <div>
        {/* Profile Tab */}
        {activeTab === "profile" && (
          <div key={currentUser?.id} className="max-w-2xl space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                Informations personnelles
              </h2>
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Prénom"
                    {...profileForm.register("firstName")}
                  />
                  <Input label="Nom" {...profileForm.register("lastName")} />
                </div>
                <Input
                  label="Email"
                  type="email"
                  {...profileForm.register("email")}
                  readOnly
                />
                <Input label="Téléphone" {...profileForm.register("phone")} />
                <Textarea
                  label="Bio"
                  rows={3}
                  placeholder="Parlez-nous de vous..."
                />
              </div>
            </div>

            <div className="pt-6 border-t border-slate-200 dark:border-slate-800/40">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                Changer le mot de passe
              </h2>
              <div className="rounded-lg border border-amber-200 dark:border-amber-800/40 bg-amber-50 dark:bg-amber-900/10 p-4">
                <p className="text-sm text-amber-700 dark:text-amber-400">
                  La modification du mot de passe sera disponible dans une
                  prochaine version.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-6">
              <Button
                variant="outline"
                onClick={() =>
                  profileForm.reset({
                    firstName: currentUser?.firstName ?? "",
                    lastName: currentUser?.lastName ?? "",
                    email: currentUser?.email ?? "",
                    phone: (currentUser as any)?.phone ?? "",
                  })
                }
              >
                Annuler
              </Button>
              <Button
                variant="primary"
                onClick={onSaveProfile}
                disabled={updateProfile.isPending}
              >
                {updateProfile.isPending ? "Enregistrement..." : "Enregistrer"}
              </Button>
            </div>
          </div>
        )}

        {/* Organization Tab */}
        {activeTab === "organization" && (
          <div className="max-w-2xl space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                Informations de l'organisation
              </h2>
              <div className="space-y-4">
                <Input
                  label="Nom de l'organisation"
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                />
                <Input
                  label="Site web"
                  defaultValue={(currentOrg as any)?.website || ""}
                />
                <Textarea
                  label="Description"
                  rows={3}
                  defaultValue={(currentOrg as any)?.description || ""}
                />
                <Select
                  label="Secteur d'activité"
                  options={[
                    { value: "banque", label: "Banque / Finance" },
                    { value: "sante", label: "Santé" },
                    { value: "telecom", label: "Télécommunications" },
                    { value: "commerce", label: "Commerce" },
                    { value: "industrie", label: "Industrie" },
                    { value: "autre", label: "Autre" },
                  ]}
                  defaultValue={(currentOrg as any)?.industry || ""}
                />
                <Input
                  label="Pays"
                  defaultValue={(currentOrg as any)?.country || ""}
                />
              </div>
            </div>

            <div className="pt-6 border-t border-slate-200 dark:border-slate-800/40">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                Facturation
              </h2>
              <div className="space-y-4">
                <Select
                  label="Formule"
                  options={[
                    { value: "essentialiel", label: "Essentiel" },
                    { value: "pro", label: "Pro" },
                    { value: "business", label: "Business" },
                    { value: "institution", label: "Institution" },
                  ]}
                  defaultValue={currentOrg?.subscriptionPlan || ""}
                />
                <Input
                  label="Email de facturation"
                  type="email"
                  defaultValue={currentOrg?.email || ""}
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-6">
              <Button
                variant="outline"
                onClick={() => setOrgName((currentOrg as any)?.name || "")}
              >
                Annuler
              </Button>
              <Button
                variant="primary"
                onClick={handleSaveOrg}
                disabled={updateOrg.isPending}
              >
                {updateOrg.isPending ? "Enregistrement..." : "Enregistrer"}
              </Button>
            </div>
          </div>
        )}

        {/* Notifications Tab */}
        {activeTab === "notifications" && (
          <div className="max-w-2xl space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                Préférences de notifications
              </h2>
              <div className="space-y-4">
                <label className="flex items-start gap-3 cursor-pointer">
                  <Checkbox
                    checked={emailNotifications}
                    onChange={(e) => setEmailNotifications(e.target.checked)}
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-900 dark:text-white">
                      Notifications par email
                    </p>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                      Recevoir les notifications importantes par email
                    </p>
                  </div>
                </label>

                <label className="flex items-start gap-3 cursor-pointer">
                  <Checkbox
                    checked={inAppNotifications}
                    onChange={(e) => setInAppNotifications(e.target.checked)}
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-900 dark:text-white">
                      Notifications dans l'application
                    </p>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                      Recevoir des notifications push sur votre navigateur
                    </p>
                  </div>
                </label>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-200 dark:border-slate-800/40">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                Notifications par type
              </h2>
              <div className="space-y-3">
                {[
                  { id: "feedbacks", label: "Nouveaux feedbacks" },
                  { id: "complaints", label: "Nouvelles réclamations" },
                  { id: "qr_scans", label: "Scans QR codes" },
                  { id: "reports", label: "Rapports générés" },
                  { id: "users", label: "Nouveaux utilisateurs" },
                ].map((item) => (
                  <label
                    key={item.id}
                    className="flex items-center gap-3 cursor-pointer"
                  >
                    <Checkbox
                      checked={eventPreferences[item.id] ?? true}
                      onChange={(e) =>
                        setEventPreferences((current) => ({
                          ...current,
                          [item.id]: e.target.checked,
                        }))
                      }
                    />
                    <span className="text-sm text-slate-700 dark:text-slate-300">
                      {item.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-6">
              <Button variant="outline">Annuler</Button>
              <Button
                variant="primary"
                onClick={handleSaveNotifications}
                disabled={updateNotificationPreferences.isPending}
              >
                {updateNotificationPreferences.isPending
                  ? "Enregistrement..."
                  : "Enregistrer"}
              </Button>
            </div>
          </div>
        )}

        {/* Security Tab */}
        {activeTab === "security" && (
          <div className="max-w-2xl space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                Authentification
              </h2>
              <div className="space-y-4">
                <div className="flex items-start gap-3 opacity-50 cursor-not-allowed">
                  <Checkbox checked={false} readOnly />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-slate-900 dark:text-white">
                        Authentification à deux facteurs
                      </p>
                      <span className="text-[10px] font-medium uppercase tracking-wide px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400">
                        Bientôt disponible
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                      Sécurisez votre compte avec Google Authenticator ou Authy
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-6">
              <Button variant="outline">Annuler</Button>
              <Button
                variant="primary"
                onClick={handleSaveSecurity}
                disabled={updatePrefs.isPending}
              >
                {updatePrefs.isPending ? "Enregistrement..." : "Enregistrer"}
              </Button>
            </div>
          </div>
        )}

        {/* Appearance Tab */}
        {activeTab === "appearance" && (
          <div className="max-w-2xl space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                Thème
              </h2>
              <div className="space-y-3">
                {[
                  {
                    id: "light",
                    label: "Clair",
                    description: "Thème lumineux",
                  },
                  { id: "dark", label: "Sombre", description: "Thème sombre" },
                  {
                    id: "system",
                    label: "Système",
                    description: "Suit les préférences système",
                  },
                ].map((theme) => (
                  <label
                    key={theme.id}
                    className="flex items-center gap-3 p-4 rounded-lg border border-slate-200 dark:border-slate-800/60 cursor-pointer hover:bg-slate-50 dark:hover:bg-[#0f0f0f] transition-colors"
                  >
                    <input
                      type="radio"
                      name="theme"
                      checked={selectedTheme === theme.id}
                      onChange={() => setSelectedTheme(theme.id)}
                    />
                    <div>
                      <p className="text-sm font-medium text-slate-900 dark:text-white">
                        {theme.label}
                      </p>
                      <p className="text-xs text-slate-600 dark:text-slate-400">
                        {theme.description}
                      </p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-6">
              <Button
                variant="outline"
                onClick={() => setSelectedTheme(currentTheme ?? "system")}
              >
                Annuler
              </Button>
              <Button
                variant="primary"
                onClick={handleSaveAppearance}
                disabled={updatePrefs.isPending}
              >
                {updatePrefs.isPending ? (
                  "Enregistrement..."
                ) : (
                  <span className="flex items-center gap-2">
                    Enregistrer
                    {isDirtyAppearance && (
                      <span className="h-2 w-2 rounded-full bg-red-500 inline-block" />
                    )}
                  </span>
                )}
              </Button>
            </div>
          </div>
        )}

        {/* Subscription Tab */}
        {activeTab === "subscription" && (
          <SubscriptionTab usage={orgUsage} isLoading={usageLoading} />
        )}

        {/* Localization Tab */}
        {activeTab === "localization" && (
          <div className="max-w-2xl space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                Langue et région
              </h2>
              <div className="space-y-4">
                <Select
                  label="Langue"
                  options={[
                    { value: "fr", label: "Français" },
                    { value: "en", label: "English" },
                    { value: "es", label: "Español" },
                  ]}
                  value={selectedLang}
                  onChange={(val) => setSelectedLang(val)}
                />
                <Select
                  label="Fuseau horaire"
                  options={[
                    { value: "Europe/Paris", label: "Europe/Paris (GMT+1)" },
                    { value: "Europe/London", label: "Europe/London (GMT+0)" },
                    {
                      value: "America/New_York",
                      label: "America/New_York (GMT-5)",
                    },
                  ]}
                  value={selectedTz}
                  onChange={(val) => setSelectedTz(val)}
                />
                <Select
                  label="Format de date"
                  options={[
                    { value: "DD/MM/YYYY", label: "JJ/MM/AAAA" },
                    { value: "MM/DD/YYYY", label: "MM/JJ/AAAA" },
                    { value: "YYYY-MM-DD", label: "AAAA-MM-JJ" },
                  ]}
                  value={selectedDateFormat}
                  onChange={(val) => setSelectedDateFormat(val)}
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-6">
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedLang("fr");
                  setSelectedTz("Africa/Dakar");
                }}
              >
                Annuler
              </Button>
              <Button
                variant="primary"
                onClick={handleSaveLocalization}
                disabled={updatePrefs.isPending}
              >
                {updatePrefs.isPending ? "Enregistrement..." : "Enregistrer"}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
