'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useLogin } from '@/hooks';
import { getErrorMessage } from '@/lib/api/client';
import { LogIn, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const login = useLogin();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    login.mutate(
      { email, password },
      {
        onSuccess: () => {
          router.push('/dashboard');
        },
        onError: (err) => {
          console.error('Erreur de connexion:', err);
          setError(getErrorMessage(err));
        },
      }
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-[#0a0a0a] dark:to-[#1a1a1a] p-4">
      <div className="w-full max-w-md">
        {/* Logo et titre */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary-600 mb-4">
            <LogIn className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
            SatisClient
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Connectez-vous à votre compte
          </p>
        </div>

        {/* Formulaire */}
        <div className="rounded-2xl bg-white dark:bg-[#0f0f0f] border border-slate-200 dark:border-slate-800/60 p-8 shadow-lg">
          <form onSubmit={handleLogin} className="space-y-6">
            {error && (
              <div className="flex items-center gap-2 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/60 p-3">
                <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0" />
                <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
              </div>
            )}

            <Input
              label="Email"
              type="email"
              placeholder="votre@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />

            <Input
              label="Mot de passe"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />

            <div className="flex justify-end">
              <Link href="/forgot-password" className="text-xs text-slate-500 hover:text-[#3a5a40] transition-colors">
                Mot de passe oublié ?
              </Link>
            </div>

            <Button
              type="submit"
              variant="primary"
              className="w-full"
              disabled={login.isPending}
            >
              {login.isPending ? (
                <span className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                  Connexion...
                </span>
              ) : (
                'Se connecter'
              )}
            </Button>
          </form>

          <p className="text-center text-sm text-slate-500 dark:text-slate-400 mt-4">
            Pas encore de compte ?{' '}
            <Link href="/register" className="text-primary-600 font-medium hover:underline">
              Créer un compte
            </Link>
          </p>

          {/* Infos de test */}
          <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-800/60">
            <p className="text-xs text-slate-500 dark:text-slate-400 text-center mb-2">
              Compte de test :
            </p>
            <div className="text-xs text-slate-600 dark:text-slate-400 space-y-1 bg-slate-50 dark:bg-[#1a1a1a] rounded-lg p-3">
              <p><strong>Email:</strong> admin@satisclient.fr</p>
              <p><strong>Mot de passe:</strong> Admin123!Pass</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-slate-500 dark:text-slate-400 mt-6">
          SatisClient © 2024 - Plateforme de satisfaction client
        </p>
      </div>
    </div>
  );
}
