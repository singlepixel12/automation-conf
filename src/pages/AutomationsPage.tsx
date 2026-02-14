import { useState } from 'react';
import { motion } from 'framer-motion';
import { AutomationsGrid } from '@/components/automations/AutomationsGrid';
import { AddAutomationDialog } from '@/components/automations/AddAutomationDialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search } from 'lucide-react';

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] as const } },
};

export function AutomationsPage() {
  const [searchText, setSearchText] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <motion.div
      className="space-y-4"
      variants={stagger}
      initial="hidden"
      animate="show"
    >
      <motion.div variants={fadeUp} className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Automations</h2>
          <p className="text-muted-foreground">Manage automation configurations.</p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="h-4 w-4" />
          Add Automation
        </Button>
      </motion.div>

      <motion.div variants={fadeUp} className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search automations..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          className="pl-9"
        />
      </motion.div>

      <motion.div variants={fadeUp}>
        <AutomationsGrid searchText={searchText} />
      </motion.div>

      <AddAutomationDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </motion.div>
  );
}
