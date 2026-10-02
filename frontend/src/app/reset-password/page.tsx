'use client';

import { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { apiClient } from '@/lib/api/client';
import { CheckCircle, AlertCircle } from 'lucide-react';

function ResetForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token') || '';
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }
    if (password.length < 12) {
      setError('Le mot de passe doit contenir au moins 12 caractères');
      return;
    }
    if (!/[a-z]/.test(password) || !/[A-Z]/.test(password) || !/\d/.test(password) || !/[@$!%*?&#^()_+\-={}\[\]|;:,.<>~]/.test(password)) {
      setError('Utilisez au moins une minuscule, une majuscule, un chiffre et un caractère spécial');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await apiClient.post('/auth/reset-password', { token, password });
      setSuccess(true);
      setTimeout(() => router.push('/login'), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Lien invalide ou expiré');
    } finally {
      setLoading(false);
    }
  };

  if (!token) return <p className="text-center text-slate-500">Lien invalide.</p>;

  return success ? (
    <div className="text-center py-4">
      <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
      <p className="font-semibold text-slate-900 dark:text-white">Mot de passe mis à jour !</p>
      <p className="text-sm text-slate-500 mt-1">Redirection vers la connexion...</p>
    </div>
  ) : (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="flex items-center gap-2 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 p-3">
          <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0" />
          <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
        </div>
      )}
      <Input
        label="Nouveau mot de passe"
        type="password"
        placeholder="Créer un mot de passe fort"
        helperText="Au moins 12 caractères : une minuscule, une majuscule, un chiffre et un caractère spécial."
        value={password}
        onChange={e => setPassword(e.target.value)}
        required
      />
      <Input
        label="Confirmer le mot de passe"
        type="password"
        placeholder="Répéter le mot de passe"
        value={confirm}
        onChange={e => setConfirm(e.target.value)}
        required
      />
      <Button type="submit" variant="primary" className="w-full" disabled={loading}>
        {loading ? 'Mise à jour...' : 'Définir le nouveau mot de passe'}
      </Button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#0a0a0a] p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-8 h-8 rounded-lg bg-[#3a5a40] flex items-center justify-center">
              <span className="text-white font-bold text-xs">SC</span>
            </div>
            <span className="font-bold text-lg">SatisClient</span>
          </Link>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Nouveau mot de passe</h1>
        </div>

        <div className="bg-white dark:bg-[#0f0f0f] border border-slate-200 dark:border-slate-800/60 rounded-2xl p-8 shadow-lg">
          <Suspense fallback={<div>Chargement...</div>}>
            <ResetForm />
          </Suspense>
          <div className="flex justify-center mt-4">
            <Link
              href="/login"
              className="text-sm text-slate-500 hover:text-[#3a5a40] transition-colors"
            >
              Retour à la connexion
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
