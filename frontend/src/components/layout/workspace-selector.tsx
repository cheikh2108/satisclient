'use client';

import { useCurrentUser } from '@/hooks';
import { useOrganization } from '@/hooks';
import { BrandMark } from '@/components/brand-logo';

export function WorkspaceSelector() {
  const { data: currentUser } = useCurrentUser();
  const { data: org } = useOrganization(currentUser?.organizationId || '');
  const isSuperAdmin = (currentUser as any)?.role === 'super_admin';

  const orgName = org?.name || 'SatisClient';
  const initials = orgName.split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2);
  const label = isSuperAdmin ? 'Plateforme SaaS' : 'Organisation';

  return (
    <div className={`flex w-full items-center gap-3 rounded-xl border p-3 ${
      isSuperAdmin
        ? 'border-primary-200 dark:border-primary-900/60 bg-primary-50/50 dark:bg-primary-900/10'
        : 'border-slate-200 dark:border-slate-800/60 bg-white dark:bg-[#1a1a1a]'
    }`}>
      {isSuperAdmin || !org?.name ? (
        <BrandMark size={36} className="h-9 w-9" />
      ) : (
        <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-slate-800 dark:bg-slate-700">
          <span className="text-sm font-bold text-white">{initials}</span>
        </div>
      )}
      <div className="flex-1 text-left">
        {isSuperAdmin && (
          <p className="text-[10px] font-medium uppercase tracking-wide text-primary-600 dark:text-primary-400 mb-0.5">
            Plateforme SaaS
          </p>
        )}
        <p className="text-sm font-semibold text-slate-900 dark:text-white">
          {orgName}
        </p>
      </div>
    </div>
  );
}
