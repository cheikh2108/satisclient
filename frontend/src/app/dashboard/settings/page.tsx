'use client';

import React, { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { useForm } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/components/ui/toast';
import { Settings as SettingsIcon, User, Building2, Bell, Shield, Palette, Globe } from 'lucide-react';
import {
  useCurrentUser,
  useOrganization,
  useUpdateProfile,
  useUpdateOrganization,
  useUpdatePreferences,
  useSessions,
  useRevokeSession,
} from '@/hooks';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('profile');
  const { data: currentUser } = useCurrentUser();
  const { data: currentOrg } = useOrganization(currentUser?.organizationId ?? '');
  const { addToast } = useToast();

  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(false);
  const [twoFactorAuth, setTwoFactorAuth] = useState(false);
  const { theme: currentTheme, setTheme } = useTheme();
  const [selectedTheme, setSelectedTheme] = useState('system');
  const [selectedLang, setSelectedLang] = useState('fr');
  const [selectedTz, setSelectedTz] = useState('Europe/Paris');
  const [selectedDateFormat, setSelectedDateFormat] = useState('DD/MM/YYYY');

  // Mutations API
  const updateProfile = useUpdateProfile();
  const updateOrg = useUpdateOrganization();
  const updatePrefs = useUpdatePreferences();
  const { data: sessions } = useSessions();
  const revokeSession = useRevokeSession();

  // Formulaire profil (React Hook Form)
  const profileForm = useForm({
    defaultValues: {
      firstName: currentUser?.firstName ?? '',
      lastName: currentUser?.lastName ?? '',
      email: currentUser?.email ?? '',
      phone: (currentUser as any)?.phone ?? '',
    },
  });

  useEffect(() => {
    if (currentTheme) setSelectedTheme(currentTheme);
  }, [currentTheme]);

  useEffect(() => {
    if (currentUser) {
      profileForm.reset({
        firstName: currentUser.firstName ?? '',
        lastName: currentUser.lastName ?? '',
        email: currentUser.email ?? '',
        phone: (currentUser as any)?.phone ?? '',
      });
      // Charger les préférences sauvegardées
      const prefs = (currentUser as any)?.preferences as Record<string, unknown> | undefined;
      if (prefs) {
        if (prefs.emailNotifications !== undefined) setEmailNotifications(prefs.emailNotifications as boolean);
        if (prefs.pushNotifications !== undefined) setPushNotifications(prefs.pushNotifications as boolean);
        if (prefs.twoFactorEnabled !== undefined) setTwoFactorAuth(prefs.twoFactorEnabled as boolean);
        if (prefs.theme) { setSelectedTheme(prefs.theme as string); }
        if (prefs.locale) setSelectedLang(prefs.locale as string);
        if (prefs.timezone) setSelectedTz(prefs.timezone as string);
        if (prefs.dateFormat) setSelectedDateFormat(prefs.dateFormat as string);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser]);

  const onSaveProfile = profileForm.handleSubmit((data) => {
    updateProfile.mutate({
      firstName: data.firstName,
      lastName: data.lastName,
      phone: (data as any).phone || undefined,
    });
  });

  // Org name contrôlé
  const [orgName, setOrgName] = useState('');

  useEffect(() => {
    if (currentOrg) {
      setOrgName(currentOrg.name ?? '');
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
    updatePrefs.mutate({ emailNotifications, pushNotifications });
  };

  const handleSaveSecurity = () => {
    // 2FA non implémenté — rien à sauvegarder pour l'instant
    addToast({ type: 'info', title: 'Sécurité', description: 'Aucune modification à enregistrer' });
  };

  const handleSaveAppearance = () => {
    setTheme(selectedTheme);
    updatePrefs.mutate({ theme: selectedTheme });
  };

  const isDirtyAppearance = selectedTheme !== (currentTheme ?? 'system');

  const handleSaveLocalization = () => {
    updatePrefs.mutate({ locale: selectedLang, timezone: selectedTz, dateFormat: selectedDateFormat });
  };

  const tabs = [
    { id: 'profile', label: 'Profil', icon: User },
    { id: 'organization', label: 'Organisation', icon: Building2 },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Sécurité', icon: Shield },
    { id: 'appearance', label: 'Apparence', icon: Palette },
    { id: 'localization', label: 'Localisation', icon: Globe },
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
                    ? 'border-primary-600 text-primary-600 dark:text-primary-400'
                    : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
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
        {activeTab === 'profile' && (
          <div key={currentUser?.id} className="max-w-2xl space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                Informations personnelles
              </h2>
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input label="Prénom" {...profileForm.register('firstName')} />
                  <Input label="Nom" {...profileForm.register('lastName')} />
                </div>
                <Input label="Email" type="email" {...profileForm.register('email')} readOnly />
                <Input label="Téléphone" {...profileForm.register('phone')} />
                <Textarea label="Bio" rows={3} placeholder="Parlez-nous de vous..." />
              </div>
            </div>

            <div className="pt-6 border-t border-slate-200 dark:border-slate-800/40">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                Changer le mot de passe
              </h2>
              <div className="rounded-lg border border-amber-200 dark:border-amber-800/40 bg-amber-50 dark:bg-amber-900/10 p-4">
                <p className="text-sm text-amber-700 dark:text-amber-400">
                  La modification du mot de passe sera disponible dans une prochaine version.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-6">
              <Button variant="outline" onClick={() => profileForm.reset({ firstName: currentUser?.firstName ?? '', lastName: currentUser?.lastName ?? '', email: currentUser?.email ?? '', phone: (currentUser as any)?.phone ?? '' })}>Annuler</Button>
              <Button variant="primary" onClick={onSaveProfile} disabled={updateProfile.isPending}>
                {updateProfile.isPending ? 'Enregistrement...' : 'Enregistrer'}
              </Button>
            </div>
          </div>
        )}

        {/* Organization Tab */}
        {activeTab === 'organization' && (
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
                <Input label="Site web" defaultValue={(currentOrg as any)?.website || ''} />
                <Textarea label="Description" rows={3} defaultValue={(currentOrg as any)?.description || ''} />
                <Select
                  label="Secteur d'activité"
                  options={[
                    { value: 'banque', label: 'Banque / Finance' },
                    { value: 'sante', label: 'Santé' },
                    { value: 'telecom', label: 'Télécommunications' },
                    { value: 'commerce', label: 'Commerce' },
                    { value: 'industrie', label: 'Industrie' },
                    { value: 'autre', label: 'Autre' },
                  ]}
                  defaultValue={(currentOrg as any)?.industry || ''}
                />
                <Input label="Pays" defaultValue={(currentOrg as any)?.country || ''} />
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
                    { value: 'essentialiel', label: 'Essentiel' },
                    { value: 'pro', label: 'Pro' },
                    { value: 'business', label: 'Business' },
                    { value: 'institution', label: 'Institution' },
                  ]}
                  defaultValue={currentOrg?.subscriptionPlan || ''}
                />
                <Input label="Email de facturation" type="email" defaultValue={currentOrg?.email || ''} />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-6">
              <Button variant="outline" onClick={() => setOrgName((currentOrg as any)?.name || '')}>Annuler</Button>
              <Button variant="primary" onClick={handleSaveOrg} disabled={updateOrg.isPending}>
                {updateOrg.isPending ? 'Enregistrement...' : 'Enregistrer'}
              </Button>
            </div>
          </div>
        )}

        {/* Notifications Tab */}
        {activeTab === 'notifications' && (
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
                    checked={pushNotifications}
                    onChange={(e) => setPushNotifications(e.target.checked)}
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-900 dark:text-white">
                      Notifications push
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
                  { id: 'feedbacks', label: 'Nouveaux feedbacks' },
                  { id: 'complaints', label: 'Nouvelles réclamations' },
                  { id: 'qr_scans', label: 'Scans QR codes' },
                  { id: 'reports', label: 'Rapports générés' },
                  { id: 'users', label: 'Nouveaux utilisateurs' },
                ].map((item) => (
                  <label key={item.id} className="flex items-center gap-3 cursor-pointer">
                    <Checkbox defaultChecked />
                    <span className="text-sm text-slate-700 dark:text-slate-300">
                      {item.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-6">
              <Button variant="outline">Annuler</Button>
              <Button variant="primary" onClick={handleSaveNotifications} disabled={updatePrefs.isPending}>
                {updatePrefs.isPending ? 'Enregistrement...' : 'Enregistrer'}
              </Button>
            </div>
          </div>
        )}

        {/* Security Tab */}
        {activeTab === 'security' && (
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

            <div className="pt-6 border-t border-slate-200 dark:border-slate-800/40">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                Sessions actives
              </h2>
              <div className="space-y-3">
                {sessions && sessions.length > 0 ? (
                  sessions.map((session) => (
                    <div
                      key={session.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-[#1a1a1a]"
                    >
                      <div>
                        <p className="text-sm font-medium text-slate-900 dark:text-white">Session active</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Expire le {new Date(session.expiresAt).toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                      <button
                        onClick={() => revokeSession.mutate(session.id)}
                        disabled={revokeSession.isPending}
                        className="text-xs text-red-600 hover:text-red-700 font-medium disabled:opacity-50"
                      >
                        Révoquer
                      </button>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-slate-500 dark:text-slate-400">Aucune session active trouvée.</p>
                )}
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-6">
              <Button variant="outline">Annuler</Button>
              <Button variant="primary" onClick={handleSaveSecurity} disabled={updatePrefs.isPending}>
                {updatePrefs.isPending ? 'Enregistrement...' : 'Enregistrer'}
              </Button>
            </div>
          </div>
        )}

        {/* Appearance Tab */}
        {activeTab === 'appearance' && (
          <div className="max-w-2xl space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                Thème
              </h2>
              <div className="space-y-3">
                {[
                  { id: 'light', label: 'Clair', description: 'Thème lumineux' },
                  { id: 'dark', label: 'Sombre', description: 'Thème sombre' },
                  { id: 'system', label: 'Système', description: 'Suit les préférences système' },
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
              <Button variant="outline" onClick={() => setSelectedTheme(currentTheme ?? 'system')}>Annuler</Button>
              <Button variant="primary" onClick={handleSaveAppearance} disabled={updatePrefs.isPending}>
                {updatePrefs.isPending ? 'Enregistrement...' : (
                  <span className="flex items-center gap-2">
                    Enregistrer
                    {isDirtyAppearance && <span className="h-2 w-2 rounded-full bg-red-500 inline-block" />}
                  </span>
                )}
              </Button>
            </div>
          </div>
        )}

        {/* Localization Tab */}
        {activeTab === 'localization' && (
          <div className="max-w-2xl space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                Langue et région
              </h2>
              <div className="space-y-4">
                <Select
                  label="Langue"
                  options={[
                    { value: 'fr', label: 'Français' },
                    { value: 'en', label: 'English' },
                    { value: 'es', label: 'Español' },
                  ]}
                  value={selectedLang}
                  onChange={(val) => setSelectedLang(val)}
                />
                <Select
                  label="Fuseau horaire"
                  options={[
                    { value: 'Europe/Paris', label: 'Europe/Paris (GMT+1)' },
                    { value: 'Europe/London', label: 'Europe/London (GMT+0)' },
                    { value: 'America/New_York', label: 'America/New_York (GMT-5)' },
                  ]}
                  value={selectedTz}
                  onChange={(val) => setSelectedTz(val)}
                />
                <Select
                  label="Format de date"
                  options={[
                    { value: 'DD/MM/YYYY', label: 'JJ/MM/AAAA' },
                    { value: 'MM/DD/YYYY', label: 'MM/JJ/AAAA' },
                    { value: 'YYYY-MM-DD', label: 'AAAA-MM-JJ' },
                  ]}
                  value={selectedDateFormat}
                  onChange={(val) => setSelectedDateFormat(val)}
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-6">
              <Button variant="outline" onClick={() => { setSelectedLang('fr'); setSelectedTz('Africa/Dakar'); }}>Annuler</Button>
              <Button variant="primary" onClick={handleSaveLocalization} disabled={updatePrefs.isPending}>
                {updatePrefs.isPending ? 'Enregistrement...' : 'Enregistrer'}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
