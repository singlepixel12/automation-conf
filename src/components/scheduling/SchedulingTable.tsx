import { useMemo, useState, useRef, useEffect, type CSSProperties } from 'react';
import { useReducedMotion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { CalendarOff } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { EnvironmentBadge } from '@/components/automations/EnvironmentBadge';
import { useAutomationStore } from '@/stores/automationStore';
import { cn } from '@/lib/utils';
import { STATUS_COLORS, TYPE_LABELS } from '@/types/automation';
import type { Automation } from '@/types/automation';

interface SchedulingTableProps {
  searchText: string;
}

interface DispatchEffect {
  generation: number;
  distance: number;
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

function SchedulingRow({
  automation: a,
  updateAutomation,
  setStatus,
}: {
  automation: Automation;
  updateAutomation: (id: string, updates: Partial<Automation>) => void;
  setStatus: (id: string, status: Automation['status']) => void;
}) {
  const shouldReduceMotion = useReducedMotion();
  const switchRef = useRef<HTMLButtonElement>(null);
  const statusAnchorRef = useRef<HTMLDivElement>(null);
  const generationRef = useRef(0);
  const [dispatch, setDispatch] = useState<DispatchEffect | null>(null);
  const isEnabled = a.status === 'active';
  const showDispatch = dispatch !== null && isEnabled && shouldReduceMotion === false;

  useEffect(() => {
    if (!isEnabled || shouldReduceMotion) {
      generationRef.current += 1;
      // This state mirrors external status/motion changes so stale decorative
      // effects cannot survive Disable All or a preference change.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDispatch(null);
    }
  }, [isEnabled, shouldReduceMotion]);

  const handleStatusChange = (checked: boolean) => {
    if (checked && !isEnabled) {
      const generation = generationRef.current + 1;
      generationRef.current = generation;

      if (shouldReduceMotion === false) {
        const switchRect = switchRef.current?.getBoundingClientRect();
        const statusRect = statusAnchorRef.current?.getBoundingClientRect();

        if (switchRect && statusRect) {
          const switchCenter = switchRect.left + switchRect.width / 2;
          const statusCenter = statusRect.left + statusRect.width / 2;
          const distance = statusCenter - switchCenter;

          setDispatch(distance > 0 ? { generation, distance } : null);
        } else {
          setDispatch(null);
        }
      } else {
        setDispatch(null);
      }
    } else if (!checked) {
      generationRef.current += 1;
      setDispatch(null);
    }

    setStatus(a.id, checked ? 'active' : 'inactive');
  };

  return (
    <tr className="border-b last:border-0 hover:bg-muted/30 transition-colors">
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
          ref={switchRef}
          checked={isEnabled}
          onCheckedChange={handleStatusChange}
        />
      </td>
      <td className="px-4 py-3">
        <CronCell
          value={a.cronExpression}
          onChange={(v) => updateAutomation(a.id, { cronExpression: v })}
        />
      </td>
      <td className="px-4 py-3">
        <div ref={statusAnchorRef} className="relative inline-flex items-center">
          {showDispatch && (
            <span
              key={dispatch.generation}
              className="scheduling-dispatch-track"
              style={{ '--dispatch-distance': `${dispatch.distance}px` } as CSSProperties}
              aria-hidden="true"
            >
              <span
                className="scheduling-dispatch-streak"
                onAnimationEnd={() => {
                  setDispatch((current) =>
                    current?.generation === dispatch.generation ? null : current,
                  );
                }}
              />
            </span>
          )}
          {showDispatch && (
            <span
              className="scheduling-dispatch-impact"
              aria-hidden="true"
            />
          )}
          <Badge className={cn('relative z-10 border-0', STATUS_COLORS[a.status])}>
            {a.status}
          </Badge>
        </div>
      </td>
      <td className="px-4 py-3 whitespace-nowrap">{TYPE_LABELS[a.type]}</td>
      <td className="px-4 py-3">
        <EnvironmentBadge environment={a.environment} />
      </td>
    </tr>
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
          {filtered.map((a) => (
            <SchedulingRow
              key={a.id}
              automation={a}
              updateAutomation={updateAutomation}
              setStatus={setStatus}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}
