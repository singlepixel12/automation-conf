import { useMemo, useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CalendarOff } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useAutomationStore } from '@/stores/automationStore';
import { cn } from '@/lib/utils';
import { STATUS_COLORS, TYPE_LABELS } from '@/types/automation';
import type { Automation } from '@/types/automation';

interface SchedulingTableProps {
  searchText: string;
}

function matchesSearch(a: Automation, q: string) {
  const lower = q.toLowerCase();
  return (
    a.name.toLowerCase().includes(lower) ||
    a.type.toLowerCase().includes(lower) ||
    a.environment.toLowerCase().includes(lower) ||
    a.owner.toLowerCase().includes(lower) ||
    a.tags.some((t) => t.toLowerCase().includes(lower))
  );
}

function CronCell({
  value,
  onChange,
}: {
  value: string | undefined;
  onChange: (v: string | undefined) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value ?? '');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) {
      setDraft(value ?? '');
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [editing, value]);

  const commit = () => {
    const trimmed = draft.trim();
    onChange(trimmed || undefined);
    setEditing(false);
  };

  if (!editing) {
    return (
      <span
        className="cursor-pointer select-none text-xs font-mono px-1 py-0.5 rounded hover:bg-muted transition-colors"
        onDoubleClick={() => setEditing(true)}
        title="Double-click to edit"
      >
        {value || '\u2014'}
      </span>
    );
  }

  return (
    <Input
      ref={inputRef}
      className="w-40 h-8 text-xs font-mono"
      placeholder="e.g. 0 6 * * *"
      value={draft}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => {
        if (e.key === 'Enter') commit();
        if (e.key === 'Escape') setEditing(false);
      }}
    />
  );
}

export function SchedulingTable({ searchText }: SchedulingTableProps) {
  const automations = useAutomationStore((s) => s.automations);
  const updateAutomation = useAutomationStore((s) => s.updateAutomation);
  const setStatus = useAutomationStore((s) => s.setStatus);

  const filtered = useMemo(
    () => (searchText ? automations.filter((a) => matchesSearch(a, searchText)) : automations),
    [automations, searchText],
  );

  if (filtered.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
        <CalendarOff className="h-10 w-10 mb-3" />
        <p className="text-sm">No automations found.</p>
      </div>
    );
  }

  return (
    <div className="rounded-md border overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b bg-muted/50">
            <th className="px-4 py-3 text-left font-medium">Name</th>
            <th className="px-4 py-3 text-left font-medium">Enabled</th>
            <th className="px-4 py-3 text-left font-medium">CRON Schedule</th>
            <th className="px-4 py-3 text-left font-medium">Status</th>
            <th className="px-4 py-3 text-left font-medium">Type</th>
            <th className="px-4 py-3 text-left font-medium">Environment</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((a) => {
            const isEnabled = a.status === 'active';

            return (
              <tr key={a.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3 font-medium whitespace-nowrap">
                  <Link
                    to={`/automations/${a.id}`}
                    className="text-primary hover:underline"
                  >
                    {a.name}
                  </Link>
                </td>
                <td className="px-4 py-3">
                  <Switch
                    checked={isEnabled}
                    onCheckedChange={(checked) =>
                      setStatus(a.id, checked ? 'active' : 'inactive')
                    }
                  />
                </td>
                <td className="px-4 py-3">
                  <CronCell
                    value={a.cronExpression}
                    onChange={(v) => updateAutomation(a.id, { cronExpression: v })}
                  />
                </td>
                <td className="px-4 py-3">
                  <Badge className={cn('border-0', STATUS_COLORS[a.status])}>
                    {a.status}
                  </Badge>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">{TYPE_LABELS[a.type]}</td>
                <td className="px-4 py-3 capitalize">{a.environment}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
