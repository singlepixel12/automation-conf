import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trash2, Eye, EyeOff } from 'lucide-react';
import type { ConfigEntry, ConfigEntryType } from '@/types/automation';
import { useAutomationStore } from '@/stores/automationStore';

interface KeyValueRowProps {
  automationId: string;
  sectionId: string;
  entry: ConfigEntry;
}

export function KeyValueRow({ automationId, sectionId, entry }: KeyValueRowProps) {
  const updateConfigEntry = useAutomationStore((s) => s.updateConfigEntry);
  const removeConfigEntry = useAutomationStore((s) => s.removeConfigEntry);
  const [showSecret, setShowSecret] = useState(false);

  const handleValueChange = (newValue: ConfigEntry['value']) => {
    updateConfigEntry(automationId, sectionId, entry.id, newValue);
  };

  return (
    <div className="flex items-center gap-3 py-2 group">
      <div className="w-48 shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-mono">{entry.key}</span>
          {entry.required && <span className="text-red-500 text-xs">*</span>}
        </div>
        {entry.description && (
          <p className="text-xs text-muted-foreground mt-0.5">{entry.description}</p>
        )}
      </div>
      <div className="flex-1">
        <ValueInput
          type={entry.type}
          value={entry.value}
          showSecret={showSecret}
          onChange={handleValueChange}
        />
      </div>
      <Badge variant="outline" className="text-[10px] shrink-0">
        {entry.type}
      </Badge>
      {entry.type === 'secret' && (
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 shrink-0"
          onClick={() => setShowSecret(!showSecret)}
        >
          {showSecret ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
        </Button>
      )}
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 shrink-0 opacity-0 group-hover:opacity-100 text-destructive hover:text-destructive"
        onClick={() => removeConfigEntry(automationId, sectionId, entry.id)}
      >
        <Trash2 className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
}

function ValueInput({
  type,
  value,
  showSecret,
  onChange,
}: {
  type: ConfigEntryType;
  value: ConfigEntry['value'];
  showSecret: boolean;
  onChange: (v: ConfigEntry['value']) => void;
}) {
  switch (type) {
    case 'boolean':
      return (
        <Switch
          checked={value as boolean}
          onCheckedChange={(checked) => onChange(checked)}
        />
      );
    case 'number':
      return (
        <Input
          type="number"
          value={value as number}
          onChange={(e) => onChange(Number(e.target.value))}
          className="h-8 max-w-[200px]"
        />
      );
    case 'secret':
      return (
        <Input
          type={showSecret ? 'text' : 'password'}
          value={value as string}
          onChange={(e) => onChange(e.target.value)}
          className="h-8 font-mono"
        />
      );
    default:
      return (
        <Input
          type="text"
          value={value as string}
          onChange={(e) => onChange(e.target.value)}
          className="h-8"
        />
      );
  }
}
