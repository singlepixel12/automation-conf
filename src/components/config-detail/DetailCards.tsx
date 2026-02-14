import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Copy, Check, Link2 } from 'lucide-react';

export function MetaItem({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string }) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-2 text-muted-foreground mb-1">
          <Icon className="h-3.5 w-3.5" />
          <span className="text-xs font-medium">{label}</span>
        </div>
        <p className="text-sm font-semibold capitalize">{value}</p>
      </CardContent>
    </Card>
  );
}

export function EditableSelectCard({
  icon: Icon,
  label,
  value,
  displayValue,
  onChange,
  options,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  displayValue: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-2 text-muted-foreground mb-1">
          <Icon className="h-3.5 w-3.5" />
          <span className="text-xs font-medium">{label}</span>
        </div>
        <Select value={value} onValueChange={onChange}>
          <SelectTrigger className="h-7 border-0 p-0 text-sm font-semibold capitalize shadow-none focus:ring-0 focus:ring-offset-0">
            <SelectValue>{displayValue}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            {options.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardContent>
    </Card>
  );
}

export function EditableTextCard({
  icon: Icon,
  label,
  value,
  onChange,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);

  const commit = () => {
    if (draft.trim() && draft.trim() !== value) {
      onChange(draft.trim());
    } else {
      setDraft(value);
    }
    setEditing(false);
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-2 text-muted-foreground mb-1">
          <Icon className="h-3.5 w-3.5" />
          <span className="text-xs font-medium">{label}</span>
        </div>
        {editing ? (
          <Input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={commit}
            onKeyDown={(e) => {
              if (e.key === 'Enter') commit();
              if (e.key === 'Escape') { setDraft(value); setEditing(false); }
            }}
            className="h-7 p-0 border-0 shadow-none text-sm font-semibold focus-visible:ring-0 focus-visible:ring-offset-0"
            autoFocus
          />
        ) : (
          <p
            className="text-sm font-semibold capitalize cursor-pointer hover:text-primary transition-colors"
            onClick={() => { setDraft(value); setEditing(true); }}
          >
            {value}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

export function ApiEndpointBar({
  automationId,
  copied,
  onCopy,
}: {
  automationId: string;
  copied: boolean;
  onCopy: () => void;
}) {
  const endpoint = `https://api.confighub.acmecorp.com/v1/automations/${automationId}/config`;

  return (
    <div className="flex items-center gap-3 rounded-lg border bg-muted/50 px-4 py-3">
      <Link2 className="h-4 w-4 text-muted-foreground shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-xs text-muted-foreground mb-0.5">API Endpoint</p>
        <code className="text-sm font-mono text-muted-foreground select-all truncate block">
          {endpoint}
        </code>
      </div>
      <Button variant="outline" size="sm" onClick={onCopy} className="shrink-0">
        {copied ? <Check className="h-3.5 w-3.5 mr-1" /> : <Copy className="h-3.5 w-3.5 mr-1" />}
        {copied ? 'Copied' : 'Copy'}
      </Button>
    </div>
  );
}
