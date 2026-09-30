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
  const shouldReduceMotion = useReducedMotion();

  const total = automations.length;
  const active = automations.filter((a) => a.status === 'active').length;
  const errors = automations.filter((a) => a.status === 'error').length;
  const drafts = automations.filter((a) => a.status === 'draft').length;

  const typeCounts = automations.reduce<Partial<Record<AutomationType, number>>>((acc, automation) => {
    acc[automation.type] = (acc[automation.type] ?? 0) + 1;
    return acc;
  }, {});

  const byType = (Object.entries(TYPE_LABELS) as [AutomationType, string][]).map(
    ([type, label]) => ({
      type,
      label,
      count: typeCounts[type] ?? 0,
    })
  );

  const recent = [...automations]
    .sort((a, b) => new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime())
    .slice(0, 8);

  // Total always links: the list is where new automations get added, even from
  // zero. The status cards only link when there is something to inspect, so a
  // zero (notably zero errors) stays a calm, static summary.
  const stats = [
    {
      title: 'Total Automations',
      value: total,
      icon: Bot,
      variant: 'default' as const,
      to: '/automations',
      actionLabel: 'View all automations',
    },
    {
      title: 'Active',
      value: active,
      icon: CheckCircle,
      variant: 'success' as const,
      to: active > 0 ? '/automations?status=active' : undefined,
      actionLabel: 'View active automations',
    },
    {
      title: 'Errors',
      value: errors,
      icon: AlertTriangle,
      variant: 'error' as const,
      to: errors > 0 ? '/automations?status=error' : undefined,
      actionLabel: 'View automations with errors',
    },
    {
      title: 'Drafts',
      value: drafts,
      icon: FileText,
      variant: 'warning' as const,
      to: drafts > 0 ? '/automations?status=draft' : undefined,
      actionLabel: 'View draft automations',
    },
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

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5">
        {stats.map((s) => (
          <motion.div
            key={s.title}
            className={s.title === 'Total Automations' ? 'h-full lg:col-span-2' : 'h-full'}
            variants={pageItemVariants}
          >
            <StatCard
              title={s.title}
              value={s.value}
              icon={s.icon}
              variant={s.variant}
              prominence={s.title === 'Total Automations' ? 'primary' : 'supporting'}
              to={s.to}
              actionLabel={s.actionLabel}
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
