'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { apiClient } from '@/lib/api/client';
import { Mail, ArrowLeft } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await apiClient.post('/auth/forgot-password', { email });
    } catch {
      // Silence volontaire — anti-énumération
    }
    setSent(true); // Toujours afficher le succès (anti-énumération)
    setLoading(false);
  };

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
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Mot de passe oublié</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Nous vous enverrons un lien de réinitialisation</p>
        </div>

        <div className="bg-white dark:bg-[#0f0f0f] border border-slate-200 dark:border-slate-800/60 rounded-2xl p-8 shadow-lg">
          {sent ? (
            <div className="text-center py-4">
              <Mail className="h-12 w-12 text-[#3a5a40] mx-auto mb-3" />
              <p className="font-semibold text-slate-900 dark:text-white mb-2">Lien envoyé</p>
              <p className="text-sm text-slate-500">
                Si cet email existe dans notre système, vous recevrez un lien de réinitialisation dans les prochaines minutes.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Email"
                type="email"
                placeholder="votre@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
              <Button type="submit" variant="primary" className="w-full" disabled={loading}>
                {loading ? 'Envoi...' : 'Envoyer le lien'}
              </Button>
            </form>
          )}
          <div className="flex justify-center mt-4">
            <Link
              href="/login"
              className="flex items-center gap-1 text-sm text-slate-500 hover:text-[#3a5a40] transition-colors"
            >
              <ArrowLeft className="h-3 w-3" /> Retour à la connexion
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
