import { useState } from 'react';
import { AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
import { KeyValueRow } from './KeyValueRow';
import { Plus, Trash2 } from 'lucide-react';
import { useAutomationStore } from '@/stores/automationStore';
import { toast } from '@/lib/useToast';
import { cn } from '@/lib/utils';
import type { ConfigSection as ConfigSectionType, ConfigEntryType } from '@/types/automation';

interface ConfigSectionProps {
  automationId: string;
  section: ConfigSectionType;
}

export function ConfigSectionComponent({ automationId, section }: ConfigSectionProps) {
  const addConfigEntry = useAutomationStore((s) => s.addConfigEntry);
  const removeConfigSection = useAutomationStore((s) => s.removeConfigSection);
  const [adding, setAdding] = useState(false);
  const [newKey, setNewKey] = useState('');
  const [newType, setNewType] = useState<ConfigEntryType>('text');
  const [attempted, setAttempted] = useState(false);

  const handleAddEntry = () => {
    setAttempted(true);
    if (!newKey.trim()) return;
    const defaultValues: Record<ConfigEntryType, string | number | boolean> = {
      text: '', uuid: '',
      int4: 0, int8: 0, float8: 0,
      bool: false,
      date: '', time: '', timestamp: '', timestamptz: '',
      jsonb: '{}',
      secret: '',
    };
    addConfigEntry(automationId, section.id, {
      key: newKey.trim(),
      value: defaultValues[newType],
      type: newType,
      required: false,
    });
    setNewKey('');
    setNewType('text');
    setAdding(false);
    setAttempted(false);
  };

  const handleRemoveSection = () => {
    removeConfigSection(automationId, section.id);
    toast('Section removed');
  };

  return (
    <AccordionItem value={section.id}>
      <AccordionTrigger className="px-4 hover:no-underline">
        <div className="flex items-center gap-3">
          <span className="font-semibold">{section.name}</span>
          <span className="text-xs text-muted-foreground">
            {section.entries.length} {section.entries.length === 1 ? 'entry' : 'entries'}
          </span>
        </div>
      </AccordionTrigger>
      <AccordionContent className="px-4">
        {section.description && (
          <p className="text-sm text-muted-foreground mb-3">{section.description}</p>
        )}

        <div className="divide-y">
          {section.entries.map((entry) => (
            <KeyValueRow
              key={entry.id}
              automationId={automationId}
              sectionId={section.id}
              entry={entry}
            />
          ))}
        </div>

        {section.entries.length === 0 && !adding && (
          <p className="text-sm text-muted-foreground py-3 text-center">
            No entries. Add one below.
          </p>
        )}

        {adding ? (
          <div className="relative pt-3 border-t mt-3">
            <div className="flex items-end gap-3">
              <div className="flex-1 space-y-1">
                <Label className="text-xs">Key</Label>
                <Input
                  value={newKey}
                  onChange={(e) => setNewKey(e.target.value)}
                  placeholder="config_key"
                  className={cn(
                    'h-8 font-mono focus-visible:ring-1 focus-visible:ring-offset-0',
                    attempted && !newKey.trim() && 'border-destructive ring-1 ring-destructive/30'
                  )}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddEntry()}
                  autoFocus
                />
              </div>
            <div className="w-40 space-y-1">
              <Label className="text-xs">Type</Label>
              <Select value={newType} onValueChange={(v) => setNewType(v as ConfigEntryType)}>
                <SelectTrigger className="h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Text</SelectLabel>
                    <SelectItem value="text">text</SelectItem>
                    <SelectItem value="uuid">uuid</SelectItem>
                  </SelectGroup>
                  <SelectGroup>
                    <SelectLabel>Numeric</SelectLabel>
                    <SelectItem value="int4">int4</SelectItem>
                    <SelectItem value="int8">int8</SelectItem>
                    <SelectItem value="float8">float8</SelectItem>
                  </SelectGroup>
                  <SelectGroup>
                    <SelectLabel>Boolean</SelectLabel>
                    <SelectItem value="bool">bool</SelectItem>
                  </SelectGroup>
                  <SelectGroup>
                    <SelectLabel>Date & Time</SelectLabel>
                    <SelectItem value="date">date</SelectItem>
                    <SelectItem value="time">time</SelectItem>
                    <SelectItem value="timestamp">timestamp</SelectItem>
                    <SelectItem value="timestamptz">timestamptz</SelectItem>
                  </SelectGroup>
                  <SelectGroup>
                    <SelectLabel>JSON</SelectLabel>
                    <SelectItem value="jsonb">jsonb</SelectItem>
                  </SelectGroup>
                  <SelectGroup>
                    <SelectLabel>Other</SelectLabel>
                    <SelectItem value="secret">secret</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
              <Button size="sm" onClick={handleAddEntry} className="h-8">
                Add
              </Button>
              <Button size="sm" variant="ghost" onClick={() => { setAdding(false); setAttempted(false); }} className="h-8">
                Cancel
              </Button>
            </div>
            {attempted && !newKey.trim() && (
              <p className="text-[11px] text-destructive mt-1">Key is required</p>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-between pt-3 mt-3 border-t">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setAdding(true)}
              className="text-xs"
            >
              <Plus className="h-3.5 w-3.5 mr-1" />
              Add Entry
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-3.5 w-3.5 mr-1" />
                  Remove Section
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Remove "{section.name}"?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently remove the section and its {section.entries.length}{' '}
                    {section.entries.length === 1 ? 'entry' : 'entries'}. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleRemoveSection}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Remove
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        )}
      </AccordionContent>
    </AccordionItem>
  );
}
