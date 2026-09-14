import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Binary,
  Braces,
  Calendar,
  CalendarClock,
  Clock,
  Eye,
  EyeOff,
  FingerprintPattern,
  Globe,
  Hash,
  KeyRound,
  Sigma,
  ToggleLeft,
  Trash2,
  Type,
} from 'lucide-react';
import type { ConfigEntry, ConfigEntryType } from '@/types/automation';
import { useAutomationStore } from '@/stores/automationStore';

/**
 * One icon per config type, so `secret` can never be mistaken for `text` at a
 * glance. The type string stays visible next to the icon, so the icon is a
 * second, redundant cue rather than the only one - it carries no colour of its
 * own and inherits the badge's neutral foreground in both themes.
 */
const TYPE_ICONS: Record<ConfigEntryType, React.ComponentType<{ className?: string }>> = {
  text: Type,
  uuid: FingerprintPattern,
  int4: Hash,
  int8: Binary,
  float8: Sigma,
  bool: ToggleLeft,
  date: Calendar,
  time: Clock,
  timestamp: CalendarClock,
  timestamptz: Globe,
  jsonb: Braces,
  secret: KeyRound,
};

interface KeyValueRowProps {
  automationId: string;
  sectionId: string;
  entry: ConfigEntry;
}

export function KeyValueRow({ automationId, sectionId, entry }: KeyValueRowProps) {
  const updateConfigEntry = useAutomationStore((s) => s.updateConfigEntry);
  const removeConfigEntry = useAutomationStore((s) => s.removeConfigEntry);
  const [showSecret, setShowSecret] = useState(false);
  const TypeIcon = TYPE_ICONS[entry.type];

  const handleValueChange = (newValue: ConfigEntry['value']) => {
    updateConfigEntry(automationId, sectionId, entry.id, newValue);
  };

  return (
    <div className="flex items-center gap-3 py-2 group">
      <div className="w-48 shrink-0 overflow-hidden">
        <div className="flex items-center gap-2">
          <span className="text-sm font-mono truncate">{entry.key}</span>
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
      <Badge
        variant="outline"
        className="gap-1 border-border bg-muted text-foreground text-[10px] shrink-0"
      >
        <TypeIcon className="h-3 w-3 shrink-0" aria-hidden="true" />
        {entry.type}
      </Badge>
      {entry.type === 'secret' && (
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 shrink-0"
          aria-label={showSecret ? `Hide value for ${entry.key}` : `Show value for ${entry.key}`}
          onClick={() => setShowSecret(!showSecret)}
        >
          {showSecret ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
        </Button>
      )}
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 shrink-0 opacity-0 group-hover:opacity-100 text-destructive hover:text-destructive"
        aria-label={`Remove ${entry.key}`}
        onClick={() => removeConfigEntry(automationId, sectionId, entry.id)}
      >
        <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
      </Button>
    </div>
  );
}

const ringClass = 'focus-visible:ring-1 focus-visible:ring-offset-0';

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
    case 'bool':
      return (
        <Switch
          checked={value as boolean}
          onCheckedChange={(checked) => onChange(checked)}
        />
      );
    case 'int4':
    case 'int8':
      return (
        <Input
          type="number"
          step="1"
          value={value as number}
          onChange={(e) => onChange(Number(e.target.value))}
          className={`h-8 max-w-[200px] ${ringClass}`}
        />
      );
    case 'float8':
      return (
        <Input
          type="number"
          step="any"
          value={value as number}
          onChange={(e) => onChange(Number(e.target.value))}
          className={`h-8 max-w-[200px] ${ringClass}`}
        />
      );
    case 'date':
      return (
        <Input
          type="date"
          value={value as string}
          onChange={(e) => onChange(e.target.value)}
          className={`h-8 max-w-[200px] ${ringClass}`}
        />
      );
    case 'time':
      return (
        <Input
          type="time"
          step="1"
          value={value as string}
          onChange={(e) => onChange(e.target.value)}
          className={`h-8 max-w-[220px] ${ringClass}`}
        />
      );
    case 'timestamp':
    case 'timestamptz':
      return (
        <Input
          type="datetime-local"
          step="1"
          value={value as string}
          onChange={(e) => onChange(e.target.value)}
          className={`h-8 max-w-[260px] ${ringClass}`}
        />
      );
    case 'jsonb':
      return (
        <textarea
          value={value as string}
          onChange={(e) => onChange(e.target.value)}
          className={`flex w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm font-mono min-h-[32px] max-h-[120px] resize-y ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none ${ringClass}`}
          rows={1}
        />
      );
    case 'secret':
      return (
        <Input
          type={showSecret ? 'text' : 'password'}
          value={value as string}
          onChange={(e) => onChange(e.target.value)}
          className={`h-8 font-mono ${ringClass}`}
        />
      );
    default:
      return (
        <Input
          type="text"
          value={value as string}
          onChange={(e) => onChange(e.target.value)}
          className={`h-8 ${ringClass}`}
        />
      );
  }
}
