import { SkeletonKPIs, SkeletonTable } from '@/components/ui/skeleton';

export default function Loading() {
  return (
    <div className="space-y-6 sm:space-y-8">
      <SkeletonKPIs count={4} />
      <SkeletonTable rows={6} />
    </div>
  );
}
