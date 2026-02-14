import { motion } from 'framer-motion';
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
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">By Type</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {data.map(({ type, label, count }, idx) => {
          const Icon = typeIcons[type];
          const pct = total > 0 ? Math.round((count / total) * 100) : 0;
          return (
            <div key={type} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <Icon className="h-4 w-4 text-muted-foreground" />
                  <span>{label}</span>
                </div>
                <span className="text-muted-foreground">
                  {count} ({pct}%)
                </span>
              </div>
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-primary"
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{
                    duration: 0.6,
                    delay: 0.3 + idx * 0.08,
                    ease: [0.25, 0.1, 0.25, 1] as const,
                  }}
                />
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
