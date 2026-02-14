import type { CustomCellRendererProps } from 'ag-grid-react';
import { Badge } from '@/components/ui/badge';
import { STATUS_COLORS } from '@/types/automation';
import type { AutomationStatus } from '@/types/automation';
import { cn } from '@/lib/utils';

export function StatusBadge(props: CustomCellRendererProps) {
  const status = props.value as AutomationStatus;
  return (
    <Badge className={cn('border-0', STATUS_COLORS[status])}>
      {status}
    </Badge>
  );
}
