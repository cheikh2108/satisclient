import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-6 bg-slate-50 dark:bg-[#0a0a0a]">
      <div className="text-center">
        <p className="text-8xl font-bold text-slate-200 dark:text-slate-800">404</p>
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-white mt-4 mb-2">
          Page introuvable
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mb-8">
          La page que vous cherchez n&apos;existe pas ou a été déplacée.
        </p>
        <Link
          href="/dashboard"
          className="px-6 py-3 rounded-xl bg-primary-600 text-white text-sm font-medium hover:bg-primary-700 transition-colors"
        >
          Retour au dashboard
        </Link>
      </div>
    </div>
  );
}
