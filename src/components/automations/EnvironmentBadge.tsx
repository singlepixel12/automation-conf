import { badgeVariants } from '@/components/ui/badge';
import { ENVIRONMENT_PRESENTATION } from '@/types/automation';
import type { Environment } from '@/types/automation';
import { cn } from '@/lib/utils';

export function EnvironmentBadge({
  environment,
  className,
}: {
  environment: Environment;
  className?: string;
}) {
  const presentation = ENVIRONMENT_PRESENTATION[environment];
  if (!presentation) return null;
  return (
    <span
      className={cn(
        badgeVariants({ variant: 'outline' }),
        presentation.className,
        className
      )}
    >
      {presentation.label}
    </span>
  );
}
