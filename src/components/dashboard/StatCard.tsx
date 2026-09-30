import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useAnimatedCounter } from '@/lib/useAnimatedCounter';
import { ERROR_PRESENTATION } from '@/types/automation';
import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  variant?: 'default' | 'success' | 'error' | 'warning';
  prominence?: 'primary' | 'supporting';
  /** When set, the whole card links here. Omit it to render a static summary. */
  to?: string;
  /** Describes the link destination, e.g. "View active automations". */
  actionLabel?: string;
}

const variantStyles = {
  default: {
    value: 'text-primary',
    icon: 'bg-muted text-primary',
    surface: '',
    hover: 'group-hover:border-primary/40',
  },
  success: {
    value: 'text-emerald-600 dark:text-emerald-400',
    icon: 'bg-muted text-emerald-600 dark:text-emerald-400',
    surface: '',
    hover: 'group-hover:border-emerald-500/50',
  },
  error: {
    value: ERROR_PRESENTATION.statValue,
    icon: ERROR_PRESENTATION.badge,
    surface: 'border-red-300 bg-red-50/60 dark:border-red-800 dark:bg-red-950/30',
    hover: 'group-hover:border-red-400 dark:group-hover:border-red-700',
  },
  warning: {
    value: 'text-amber-600 dark:text-amber-400',
    icon: 'bg-muted text-amber-600 dark:text-amber-400',
    surface: '',
    hover: 'group-hover:border-amber-500/50',
  },
};

const calmErrorStyles = {
  value: 'text-muted-foreground',
  icon: 'bg-muted/60 text-muted-foreground',
  surface: '',
  hover: '',
};

export function StatCard({
  title,
  value,
  icon: Icon,
  variant = 'default',
  prominence = 'supporting',
  to,
  actionLabel,
}: StatCardProps) {
  const displayValue = useAnimatedCounter(value);
  const styles = variant === 'error' && value === 0 ? calmErrorStyles : variantStyles[variant];

  const card = (
    <Card
      className={cn(
        'h-full',
        styles.surface,
        // The hover cue stays on this card: border and shadow only, nothing that
        // resizes it or touches its siblings.
        to && ['transition-[border-color,box-shadow]', 'group-hover:shadow-md', styles.hover]
      )}
    >
      <CardContent className="p-6">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4">
          <div className="min-w-0">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p
              className={cn(
                'mt-1 whitespace-nowrap font-bold tabular-nums',
                prominence === 'primary' ? 'text-4xl' : 'text-3xl',
                styles.value
              )}
            >
              {displayValue}
            </p>
          </div>
          <div className={cn('shrink-0 rounded-lg p-3', styles.icon)}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (!to) return card;

  return (
    <Link
      to={to}
      // Name the link from the final value so screen readers don't hear the
      // count tick up while it animates.
      aria-label={`${title}: ${value}.${actionLabel ? ` ${actionLabel}` : ''}`}
      className="group block h-full rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
    >
      {card}
    </Link>
  );
}
