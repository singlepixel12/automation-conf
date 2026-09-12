import { motion, useReducedMotion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { AutomationType } from '@/types/automation';
import { Bot, Clock, Database, Globe, FolderSync } from 'lucide-react';

const typeIcons: Record<AutomationType, React.ComponentType<{ className?: string }>> = {
  'rpa-bot': Bot,
  'scheduled-script': Clock,
  'data-pipeline': Database,
  'api-integration': Globe,
  'file-transfer': FolderSync,
};

interface TypeBreakdownProps {
  data: { type: AutomationType; label: string; count: number }[];
  total: number;
}

export function TypeBreakdown({ data, total }: TypeBreakdownProps) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">By Type</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:[&>li:last-child:nth-child(odd)]:col-span-2">
          {data.map(({ type, label, count }, idx) => {
            const Icon = typeIcons[type];
            const pct = total > 0 ? Math.round((count / total) * 100) : 0;
            return (
              <motion.li
                key={type}
                className="rounded-lg border bg-muted/30 p-3"
                initial={shouldReduceMotion ? false : { opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={
                  shouldReduceMotion
                    ? { duration: 0 }
                    : { duration: 0.15, delay: idx * 0.03, ease: [0.25, 0.1, 0.25, 1] as const }
                }
              >
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                  <span className="truncate">{label}</span>
                </div>
                <div className="mt-2 flex items-baseline justify-between gap-2">
                  <span className="text-2xl font-semibold tabular-nums">{count}</span>
                  <span className="text-xs font-medium text-muted-foreground tabular-nums">
                    {pct}%
                  </span>
                </div>
              </motion.li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
}
