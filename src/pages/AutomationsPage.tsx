import { useCallback, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { pageContainerVariants, pageItemVariants } from '@/lib/motion';
import { AutomationsGrid } from '@/components/automations/AutomationsGrid';
import { AddAutomationDialog } from '@/components/automations/AddAutomationDialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search } from 'lucide-react';
import { parseStatusFilterPreset } from '@/types/automation';
import type { StatusFilterPreset } from '@/types/automation';

export function AutomationsPage() {
  const [searchText, setSearchText] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const shouldReduceMotion = useReducedMotion();
  const [searchParams, setSearchParams] = useSearchParams();
  // Only real automation statuses count as a preset; anything else in the
  // query is ignored.
  const statusFilter = parseStatusFilterPreset(searchParams.get('status'));

  const setStatusFilter = useCallback(
    (status: StatusFilterPreset | null) => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        if (status) next.set('status', status);
        else next.delete('status');
        return next;
      });
    },
    [setSearchParams]
  );

  return (
    <motion.div
      className="space-y-4"
      variants={pageContainerVariants}
      initial={shouldReduceMotion ? false : 'hidden'}
      animate="show"
    >
      <motion.div variants={pageItemVariants} className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Automations</h2>
          <p className="text-muted-foreground">Manage automation configurations.</p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="h-4 w-4" />
          Add Automation
        </Button>
      </motion.div>

      <motion.div variants={pageItemVariants} className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Filter automations..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          className="pl-9"
        />
      </motion.div>

      <motion.div variants={pageItemVariants}>
        <AutomationsGrid
          searchText={searchText}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
        />
      </motion.div>

      <AddAutomationDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </motion.div>
  );
}
