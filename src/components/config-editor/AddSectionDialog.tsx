import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAutomationStore } from '@/stores/automationStore';
import { toast } from '@/lib/useToast';
import { cn } from '@/lib/utils';

interface AddSectionDialogProps {
  automationId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddSectionDialog({ automationId, open, onOpenChange }: AddSectionDialogProps) {
  const addConfigSection = useAutomationStore((s) => s.addConfigSection);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [attempted, setAttempted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAttempted(true);
    if (!name.trim()) return;
    addConfigSection(automationId, {
      name: name.trim(),
      description: description.trim() || undefined,
      entries: [],
    });
    setName('');
    setDescription('');
    setAttempted(false);
    onOpenChange(false);
    toast('Section added');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Config Section</DialogTitle>
          <DialogDescription>Add a new configuration section to group related settings.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2 relative pb-4">
            <Label htmlFor="section-name">Section Name</Label>
            <Input
              id="section-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Database Connection"
              className={cn(
                attempted && !name.trim() && 'border-destructive ring-1 ring-destructive/30'
              )}
              autoFocus
            />
            {attempted && !name.trim() && (
              <p className="absolute bottom-0 text-[11px] text-destructive">Section name is required</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="section-desc">Description (optional)</Label>
            <Input
              id="section-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of this section"
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Add Section</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
