'use client';

import { AlertTriangle, RefreshCw } from 'lucide-react';
import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
      <AlertTriangle className="h-12 w-12 text-amber-500" />
      <div className="text-center">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
          Une erreur est survenue
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 max-w-md">
          {error.message || "Une erreur inattendue s'est produite. Veuillez réessayer."}
        </p>
        <button
          onClick={reset}
          className="flex items-center gap-2 mx-auto px-4 py-2 rounded-lg bg-primary-600 text-white text-sm font-medium hover:bg-primary-700 transition-colors"
        >
          <RefreshCw className="h-4 w-4" />
          Réessayer
        </button>
      </div>
    </div>
  );
}
