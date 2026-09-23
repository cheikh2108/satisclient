import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors',
  {
    variants: {
      variant: {
        // Primary - Vert forêt
        primary: 'border-transparent bg-primary-100 text-primary-700 dark:bg-primary-900/20 dark:text-primary-400',
        // Accent - Orange terre cuite
        accent: 'border-transparent bg-accent-100 text-accent-700 dark:bg-accent-900/20 dark:text-accent-400',
        // Neutral
        secondary: 'border-transparent bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
        // Success
        success: 'border-transparent bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400',
        // Warning
        warning: 'border-transparent bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400',
        // Error/Danger
        danger: 'border-transparent bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400',
        // Outline
        outline: 'border-slate-200 text-slate-700 dark:border-slate-800 dark:text-slate-300',
      },
    },
    defaultVariants: {
      variant: 'secondary',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

/**
 * Status-specific badges for FSM states
 */
export interface StatusBadgeProps extends Omit<BadgeProps, 'variant' | 'children'> {
  status:
    | 'submitted'
    | 'in_progress'
    | 'reviewing'
    | 'approved'
    | 'rejected'
    | 'resolved'
    | 'closed'
    | 'implemented'
    | 'archived';
}

const statusConfig: Record<
  StatusBadgeProps['status'],
  { variant: BadgeProps['variant']; label: string; icon?: string }
> = {
  submitted: { variant: 'secondary', label: 'Soumis', icon: '📝' },
  in_progress: { variant: 'accent', label: 'En cours', icon: '⏱' },
  reviewing: { variant: 'warning', label: 'En révision', icon: '🔍' },
  approved: { variant: 'success', label: 'Approuvé', icon: '✓' },
  rejected: { variant: 'danger', label: 'Rejeté', icon: '✕' },
  resolved: { variant: 'primary', label: 'Résolu', icon: '✓' },
  closed: { variant: 'secondary', label: 'Fermé', icon: '🔒' },
  implemented: { variant: 'success', label: 'Implémenté', icon: '✅' },
  archived: { variant: 'outline', label: 'Archivé', icon: '📦' },
};

function StatusBadge({ status, className, ...props }: StatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <Badge variant={config.variant} className={className} {...props}>
      {config.label}
    </Badge>
  );
}

/**
 * Sentiment badge (for feedback/reviews)
 */
export interface SentimentBadgeProps extends Omit<BadgeProps, 'variant' | 'children'> {
  sentiment: 'positive' | 'neutral' | 'negative';
}

const sentimentConfig: Record<
  SentimentBadgeProps['sentiment'],
  { variant: BadgeProps['variant']; label: string; icon: string }
> = {
  positive: { variant: 'success', label: 'Positif', icon: '😊' },
  neutral: { variant: 'warning', label: 'Neutre', icon: '😐' },
  negative: { variant: 'danger', label: 'Négatif', icon: '😟' },
};

function SentimentBadge({ sentiment, className, ...props }: SentimentBadgeProps) {
  const config = sentimentConfig[sentiment];

  return (
    <Badge variant={config.variant} className={className} {...props}>
      <span>{config.icon}</span>
      {config.label}
    </Badge>
  );
}

export { Badge, badgeVariants, StatusBadge, SentimentBadge };
