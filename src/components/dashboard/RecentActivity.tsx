import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { STATUS_COLORS, TYPE_LABELS } from '@/types/automation';
import type { Automation } from '@/types/automation';
import { cn } from '@/lib/utils';
import { ArrowRight } from 'lucide-react';

interface RecentActivityProps {
  automations: Automation[];
}

const MS_PER_MINUTE = 60_000;

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / MS_PER_MINUTE);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

export function RecentActivity({ automations }: RecentActivityProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {automations.map((a) => (
            <Link
              key={a.id}
              to={`/automations/${a.id}`}
              className="group flex items-center justify-between rounded-md p-2 hover:bg-accent transition-colors"
            >
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium truncate">{a.name}</p>
                <p className="text-xs text-muted-foreground">{TYPE_LABELS[a.type]}</p>
              </div>
              <div className="flex items-center gap-3 ml-4 shrink-0">
                <Badge className={cn('border-0 text-[10px]', STATUS_COLORS[a.status])}>
                  {a.status}
                </Badge>
                <span className="text-xs text-muted-foreground w-14 text-right">
                  {timeAgo(a.lastModified)}
                </span>
                <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity -ml-1" />
              </div>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
