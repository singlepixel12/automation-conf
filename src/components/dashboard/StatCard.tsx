import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useAnimatedCounter } from '@/lib/useAnimatedCounter';
import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  variant?: 'default' | 'success' | 'error' | 'warning';
  dimmed?: boolean;
  onHover?: (hovering: boolean) => void;
}

const variantStyles = {
  default: 'text-primary',
  success: 'text-emerald-600',
  error: 'text-red-600',
  warning: 'text-amber-600',
};

export function StatCard({ title, value, icon: Icon, variant = 'default', dimmed, onHover }: StatCardProps) {
  const displayValue = useAnimatedCounter(value);

  return (
    <Card
      className={cn(
        'transition-all duration-300 ease-out',
        dimmed && 'blur-[2px] scale-[0.98] opacity-60'
      )}
      onMouseEnter={() => onHover?.(true)}
      onMouseLeave={() => onHover?.(false)}
    >
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className={cn('text-3xl font-bold mt-1', variantStyles[variant])}>{displayValue}</p>
          </div>
          <div className={cn('rounded-lg p-3 bg-muted', variantStyles[variant])}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
