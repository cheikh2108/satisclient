import Image from 'next/image';
import { cn } from '@/lib/utils';

/**
 * Icône officielle SatisClient (bulle + coche), fichier : /public/logo-icon.png
 * Fond transparent : fonctionne en thème clair comme en thème sombre.
 */
export function BrandMark({ className, size = 32 }: { className?: string; size?: number }) {
  return (
    <Image
      src="/logo-icon.png"
      alt="SatisClient"
      width={size}
      height={size}
      className={cn('flex-shrink-0 object-contain', className)}
      priority
    />
  );
}
