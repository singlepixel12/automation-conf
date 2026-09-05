import { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { pageContainerVariants, pageItemVariants } from '@/lib/motion';
import { useAutomationStore } from '@/stores/automationStore';
import { StatCard } from '@/components/dashboard/StatCard';
import { TypeBreakdown } from '@/components/dashboard/TypeBreakdown';
import { RecentActivity } from '@/components/dashboard/RecentActivity';
import { Bot, CheckCircle, AlertTriangle, FileText } from 'lucide-react';
import type { AutomationType } from '@/types/automation';
import { TYPE_LABELS } from '@/types/automation';

export function DashboardPage() {
  const automations = useAutomationStore((s) => s.automations);
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);
  const shouldReduceMotion = useReducedMotion();

  const total = automations.length;
  const active = automations.filter((a) => a.status === 'active').length;
  const errors = automations.filter((a) => a.status === 'error').length;
  const drafts = automations.filter((a) => a.status === 'draft').length;

  const byType = Object.entries(
    automations.reduce<Record<string, number>>((acc, a) => {
      acc[a.type] = (acc[a.type] || 0) + 1;
      return acc;
    }, {})
  ).map(([type, count]) => ({
    type: type as AutomationType,
    label: TYPE_LABELS[type as AutomationType],
    count,
  }));

  const recent = [...automations]
    .sort((a, b) => new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime())
    .slice(0, 8);

  const stats = [
    { title: 'Total Automations', value: total, icon: Bot, variant: 'default' as const },
    { title: 'Active', value: active, icon: CheckCircle, variant: 'success' as const },
    { title: 'Errors', value: errors, icon: AlertTriangle, variant: 'error' as const },
    { title: 'Drafts', value: drafts, icon: FileText, variant: 'warning' as const },
  ];

  return (
    <motion.div
      className="space-y-6"
      variants={pageContainerVariants}
      initial={shouldReduceMotion ? false : 'hidden'}
      animate="show"
    >
      <motion.div variants={pageItemVariants}>
        <h2 className="text-2xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">Overview of all automation configurations.</p>
      </motion.div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((s, i) => (
          <motion.div key={s.title} variants={pageItemVariants}>
            <StatCard
              title={s.title}
              value={s.value}
              icon={s.icon}
              variant={s.variant}
              dimmed={hoveredCard !== null && hoveredCard !== i}
              onHover={(h) => setHoveredCard(h ? i : null)}
            />
          </motion.div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <motion.div variants={pageItemVariants}>
          <TypeBreakdown data={byType} total={total} />
        </motion.div>
        <motion.div variants={pageItemVariants}>
          <RecentActivity automations={recent} />
        </motion.div>
      </div>
    </motion.div>
  );
}
