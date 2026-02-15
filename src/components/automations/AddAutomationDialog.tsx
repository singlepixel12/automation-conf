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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAutomationStore } from '@/stores/automationStore';
import { toast } from '@/lib/useToast';
import { cn } from '@/lib/utils';
import { TYPE_LABELS } from '@/types/automation';
import type { AutomationType, Environment } from '@/types/automation';

interface AddAutomationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddAutomationDialog({ open, onOpenChange }: AddAutomationDialogProps) {
  const addAutomation = useAutomationStore((s) => s.addAutomation);
  const [name, setName] = useState('');
  const [type, setType] = useState<AutomationType>('rpa-bot');
  const [environment, setEnvironment] = useState<Environment>('development');
  const [owner, setOwner] = useState('');
  const [description, setDescription] = useState('');
  const [attempted, setAttempted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAttempted(true);
    if (!name.trim() || !owner.trim()) return;
    addAutomation({
      name: name.trim(),
      type,
      status: 'draft',
      environment,
      owner: owner.trim(),
      description: description.trim(),
      tags: [],
    });
    setName('');
    setOwner('');
    setDescription('');
    setType('rpa-bot');
    setEnvironment('development');
    setAttempted(false);
    onOpenChange(false);
    toast('Automation created');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Automation</DialogTitle>
          <DialogDescription>Create a new automation configuration.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2 relative pb-4">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="My Automation"
              className={cn(
                attempted && !name.trim() && 'border-destructive ring-1 ring-destructive/30'
              )}
            />
            {attempted && !name.trim() && (
              <p className="absolute bottom-0 text-[11px] text-destructive">Name is required</p>
            )}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Type</Label>
              <Select value={type} onValueChange={(v) => setType(v as AutomationType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(TYPE_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Environment</Label>
              <Select value={environment} onValueChange={(v) => setEnvironment(v as Environment)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="development">Development</SelectItem>
                  <SelectItem value="staging">Staging</SelectItem>
                  <SelectItem value="production">Production</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2 relative pb-4">
            <Label htmlFor="owner">Owner</Label>
            <Input
              id="owner"
              value={owner}
              onChange={(e) => setOwner(e.target.value)}
              placeholder="John Doe"
              className={cn(
                attempted && !owner.trim() && 'border-destructive ring-1 ring-destructive/30'
              )}
            />
            {attempted && !owner.trim() && (
              <p className="absolute bottom-0 text-[11px] text-destructive">Owner is required</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What does this automation do?" />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Create</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
