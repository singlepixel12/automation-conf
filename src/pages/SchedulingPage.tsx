import { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { pageContainerVariants, pageItemVariants } from '@/lib/motion';
import { Search, ShieldOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { SchedulingTable } from '@/components/scheduling/SchedulingTable';
import { useAutomationStore } from '@/stores/automationStore';

export function SchedulingPage() {
  const [searchText, setSearchText] = useState('');
  const disableAll = useAutomationStore((s) => s.disableAll);
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      className="space-y-4"
      variants={pageContainerVariants}
      initial={shouldReduceMotion ? false : 'hidden'}
      animate="show"
    >
      <motion.div variants={pageItemVariants} className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Scheduling</h2>
          <p className="text-muted-foreground">Toggle automations and manage CRON schedules.</p>
        </div>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive">
              <ShieldOff className="h-4 w-4" />
              Disable All
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Disable all automations?</AlertDialogTitle>
              <AlertDialogDescription>
                This will set every automation to inactive. You can re-enable them individually afterwards.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={disableAll}>
                Disable All
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </motion.div>

      <motion.div variants={pageItemVariants} className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search automations..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          className="pl-9"
        />
      </motion.div>

      <motion.div variants={pageItemVariants}>
        <SchedulingTable searchText={searchText} />
      </motion.div>
    </motion.div>
  );
}
