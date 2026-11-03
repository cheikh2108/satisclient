'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { apiClient } from '@/lib/api/client';
import { AlertCircle, CheckCircle, Check, X } from 'lucide-react';
import { BrandMark } from '@/components/brand-logo';

const criteria = [
  { label: 'Au moins 12 caractères', test: (p: string) => p.length >= 12 },
  { label: 'Une lettre majuscule (A-Z)', test: (p: string) => /[A-Z]/.test(p) },
  { label: 'Une lettre minuscule (a-z)', test: (p: string) => /[a-z]/.test(p) },
  { label: 'Un chiffre (0-9)', test: (p: string) => /\d/.test(p) },
  { label: 'Un caractère spécial (!@#$...)', test: (p: string) => /[^a-zA-Z0-9]/.test(p) },
];

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '', orgName: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  const passwordChecks = useMemo(() =>
    criteria.map(c => ({ ...c, ok: c.test(form.password) })),
    [form.password]
  );
  const passwordValid = passwordChecks.every(c => c.ok);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordValid) {
      setError('Le mot de passe ne remplit pas tous les critères requis.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await apiClient.post('/auth/create-account', {
        orgName: form.orgName,
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        password: form.password,
      });
      setSuccess(true);
      setTimeout(() => router.push('/login'), 3000);
    } catch (err: any) {
      const msg = err.response?.data?.message;
      if (Array.isArray(msg)) setError(msg.join(' — '));
      else setError(msg || 'Erreur lors de la création du compte');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f5f2ed] p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <BrandMark size={32} className="w-8 h-8" />
            <span className="font-bold text-lg text-[#0a0a0a]">SatisClient</span>
          </Link>
          <h1 className="text-2xl font-bold text-[#0a0a0a]">Créer votre compte</h1>
          <p className="text-sm text-[#6a6a6a] mt-1">7 jours d'essai gratuit, sans carte bancaire</p>
        </div>

        <div className="bg-white border border-[#e8e3d9] rounded-2xl p-8 shadow-sm">
          {success ? (
            <div className="text-center py-4">
              <CheckCircle className="h-12 w-12 text-[#3a5a40] mx-auto mb-3" />
              <p className="font-semibold text-[#0a0a0a] mb-1">Compte créé avec succès !</p>
              <p className="text-sm text-[#6a6a6a]">Redirection vers la connexion...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="flex items-start gap-2 rounded-lg bg-red-50 border border-red-200 p-3">
                  <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}

              <Input
                label="Nom de l'organisation"
                placeholder="Ex: Orange Sénégal"
                value={form.orgName}
                onChange={e => setForm({...form, orgName: e.target.value})}
                required
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  label="Prénom"
                  placeholder="Fatou"
                  value={form.firstName}
                  onChange={e => setForm({...form, firstName: e.target.value})}
                  required
                />
                <Input
                  label="Nom"
                  placeholder="Diallo"
                  value={form.lastName}
                  onChange={e => setForm({...form, lastName: e.target.value})}
                  required
                />
              </div>

              <Input
                label="Email professionnel"
                type="email"
                placeholder="vous@entreprise.sn"
                value={form.email}
                onChange={e => setForm({...form, email: e.target.value})}
                required
              />

              <div>
                <Input
                  label="Mot de passe"
                  type="password"
                  placeholder="Créer un mot de passe sécurisé"
                  value={form.password}
                  onChange={e => setForm({...form, password: e.target.value})}
                  onFocus={() => setPasswordFocused(true)}
                  required
                />

                {/* Critères de mot de passe */}
                {(passwordFocused || form.password.length > 0) && (
                  <div className="mt-2 p-3 bg-[#f5f2ed] rounded-lg border border-[#e8e3d9]">
                    <p className="text-xs font-medium text-[#4a4a4a] mb-2">Le mot de passe doit contenir :</p>
                    <ul className="space-y-1">
                      {passwordChecks.map(({ label, ok }) => (
                        <li key={label} className="flex items-center gap-2 text-xs">
                          {ok
                            ? <Check className="h-3.5 w-3.5 text-[#3a5a40] flex-shrink-0" />
                            : <X className="h-3.5 w-3.5 text-[#b0b0b0] flex-shrink-0" />
                          }
                          <span className={ok ? 'text-[#3a5a40] font-medium' : 'text-[#6a6a6a]'}>{label}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <Button
                type="submit"
                variant="primary"
                className="w-full"
                disabled={loading || (form.password.length > 0 && !passwordValid)}
              >
                {loading ? 'Création...' : 'Créer mon compte'}
              </Button>

              <p className="text-xs text-[#8a8a8a] text-center">
                En créant un compte, vous acceptez nos{' '}
                <Link href="/cgu" className="text-[#3a5a40] hover:underline">CGU</Link>
                {' '}et notre{' '}
                <Link href="/privacy" className="text-[#3a5a40] hover:underline">politique de confidentialité</Link>.
              </p>
            </form>
          )}

          <p className="text-center text-sm text-[#6a6a6a] mt-4">
            Déjà un compte ?{' '}
            <Link href="/login" className="text-[#3a5a40] font-medium hover:underline">
              Se connecter
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
