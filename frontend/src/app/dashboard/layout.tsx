'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCurrentUser } from '@/hooks';
import { Sidebar } from '@/components/layout/sidebar';
import { Topbar } from '@/components/layout/topbar';
import { ErrorBoundary } from '@/components/ui/error-boundary';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { data: currentUser, isLoading, error } = useCurrentUser();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && (error || !currentUser)) {
      router.replace('/login');
    }
  }, [currentUser, isLoading, error, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#0a0a0a]">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-slate-500 dark:text-slate-400">Chargement...</p>
        </div>
      </div>
    );
  }

  if (error || !currentUser) return null;

  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a0a]">
      <Sidebar />

      {/* Main content - Fixed padding pour sidebar 280px */}
      <div className="lg:pl-[280px]">
        <Topbar />

        <main className="p-4 sm:p-6 lg:p-8">
          <ErrorBoundary>
            {children}
          </ErrorBoundary>
        </main>
      </div>
    </div>
  );
}
