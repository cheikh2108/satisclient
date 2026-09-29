import { SkeletonKPIs, SkeletonTable } from '@/components/ui/skeleton';

export default function DashboardLoading() {
  return (
    <div className="space-y-6">
      <div className="h-8 w-48 animate-pulse rounded-md bg-slate-200 dark:bg-slate-800" />
      <SkeletonKPIs count={4} />
      <SkeletonTable rows={6} />
    </div>
  );
}
