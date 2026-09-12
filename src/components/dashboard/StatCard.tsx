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
}

const variantStyles = {
  default: {
    value: 'text-primary',
    icon: 'bg-muted text-primary',
    surface: '',
  },
  success: {
    value: 'text-emerald-600 dark:text-emerald-400',
    icon: 'bg-muted text-emerald-600 dark:text-emerald-400',
    surface: '',
  },
  error: {
    value: ERROR_PRESENTATION.statValue,
    icon: ERROR_PRESENTATION.badge,
    surface: 'border-red-300 bg-red-50/60 dark:border-red-800 dark:bg-red-950/30',
  },
  warning: {
    value: 'text-amber-600 dark:text-amber-400',
    icon: 'bg-muted text-amber-600 dark:text-amber-400',
    surface: '',
  },
};

const calmErrorStyles = {
  value: 'text-muted-foreground',
  icon: 'bg-muted/60 text-muted-foreground',
  surface: '',
};

export function StatCard({
  title,
  value,
  icon: Icon,
  variant = 'default',
  prominence = 'supporting',
}: StatCardProps) {
  const displayValue = useAnimatedCounter(value);
  const styles = variant === 'error' && value === 0 ? calmErrorStyles : variantStyles[variant];

  return (
    <Card className={cn('h-full', styles.surface)}>
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
          <div className={cn('rounded-lg p-3', styles.icon)}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
