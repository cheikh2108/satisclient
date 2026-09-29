import { useQuery } from '@tanstack/react-query';
import { auditApi, type AuditFilters } from '@/lib/api/audit';
import { useCurrentUser } from './useAuth';

export const auditKeys = {
  all: ['audit'] as const,
  logs: (filters?: AuditFilters) => [...auditKeys.all, 'logs', filters] as const,
  stats: (orgId?: string) => [...auditKeys.all, 'stats', orgId] as const,
};

export const useAuditLogs = (filters?: AuditFilters) => {
  const { data: currentUser } = useCurrentUser();
  const orgId = (currentUser as any)?.organizationId;
  return useQuery({
    queryKey: auditKeys.logs({ ...filters, organizationId: orgId }),
    queryFn: () => auditApi.getLogs({ ...filters, organizationId: orgId }),
    enabled: !!orgId,
  });
};

export const useAuditStats = () => {
  const { data: currentUser } = useCurrentUser();
  const orgId = (currentUser as any)?.organizationId;
  return useQuery({
    queryKey: auditKeys.stats(orgId),
    queryFn: () => auditApi.getStats(orgId),
    enabled: !!orgId,
  });
};
