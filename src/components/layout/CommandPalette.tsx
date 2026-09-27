import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bot, CalendarClock, LayoutDashboard, Search } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useAutomationStore } from '@/stores/automationStore';
import { TYPE_LABELS } from '@/types/automation';
import { cn } from '@/lib/utils';

/** Top-level routes. `/automations/:id` is dynamic and is covered by the Automations group. */
const PAGES: { id: string; label: string; to: string; icon: LucideIcon }[] = [
  { id: 'cp-page-dashboard', label: 'Dashboard', to: '/', icon: LayoutDashboard },
  { id: 'cp-page-automations', label: 'Automations', to: '/automations', icon: Bot },
  { id: 'cp-page-scheduling', label: 'Scheduling', to: '/scheduling', icon: CalendarClock },
];

interface PaletteItem {
  id: string;
  label: string;
  hint?: string;
  to: string;
  icon: LucideIcon;
}

interface PaletteGroup {
  id: string;
  label: string;
  items: PaletteItem[];
}

const LISTBOX_ID = 'command-palette-results';

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Element that held focus when the palette opened; focus returns there on close. */
  restoreFocusRef: React.RefObject<HTMLElement | null>;
}

export function CommandPalette({ open, onOpenChange, restoreFocusRef }: CommandPaletteProps) {
  const navigate = useNavigate();
  const automations = useAutomationStore((s) => s.automations);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState('');
  // Selection is held by id, so a changed result set falls back to the first
  // item without needing an effect to clamp a stale index.
  const [activeId, setActiveId] = useState<string | null>(null);

  const groups = useMemo<PaletteGroup[]>(() => {
    const q = query.trim().toLowerCase();
    const matches = (value: string) => !q || value.toLowerCase().includes(q);

    const result: PaletteGroup[] = [];
    const pages = PAGES.filter((page) => matches(page.label));
    if (pages.length > 0) {
      result.push({ id: 'cp-group-pages', label: 'Pages', items: pages });
    }

    const found = automations
      .filter((automation) => matches(automation.name))
      .map<PaletteItem>((automation) => ({
        id: `cp-automation-${automation.id}`,
        label: automation.name,
        hint: TYPE_LABELS[automation.type],
        to: `/automations/${automation.id}`,
        icon: Bot,
      }));
    if (found.length > 0) {
      result.push({ id: 'cp-group-automations', label: 'Automations', items: found });
    }

    return result;
  }, [query, automations]);

  const items = useMemo(() => groups.flatMap((group) => group.items), [groups]);
  const activeIndex = Math.max(
    0,
    items.findIndex((item) => item.id === activeId)
  );
  const activeItem = items[activeIndex];

  useEffect(() => {
    if (!activeItem) return;
    listRef.current
      ?.querySelector(`#${CSS.escape(activeItem.id)}`)
      ?.scrollIntoView({ block: 'nearest' });
  }, [activeItem]);

  const handleSelect = useCallback(
    (item: PaletteItem) => {
      onOpenChange(false);
      navigate(item.to);
    },
    [navigate, onOpenChange]
  );

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    // Escape and the focus trap stay with Radix.
    if (items.length === 0) return;

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActiveId(items[(activeIndex + 1) % items.length].id);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveId(items[(activeIndex - 1 + items.length) % items.length].id);
    } else if (event.key === 'Enter' && activeItem) {
      event.preventDefault();
      handleSelect(activeItem);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="gap-0 overflow-hidden p-0 sm:max-w-lg"
        onOpenAutoFocus={(event) => {
          event.preventDefault();
          // Reset here rather than on close, so the closing animation keeps
          // showing the results the user just acted on.
          setQuery('');
          setActiveId(null);
          inputRef.current?.focus();
        }}
        onCloseAutoFocus={(event) => {
          event.preventDefault();
          const previous = restoreFocusRef.current;
          restoreFocusRef.current = null;
          if (previous?.isConnected) {
            previous.focus({ preventScroll: true });
          }
        }}
      >
        <DialogHeader className="px-4 pb-3 pr-10 pt-4 text-left sm:text-left">
          <DialogTitle className="text-sm">Go to</DialogTitle>
          <DialogDescription className="text-xs">
            Jump to a page, or open an automation by name.
          </DialogDescription>
        </DialogHeader>

        <div className="relative border-y px-4 py-3">
          <Search className="pointer-events-none absolute left-7 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            ref={inputRef}
            role="combobox"
            aria-expanded
            aria-controls={LISTBOX_ID}
            aria-activedescendant={activeItem?.id}
            aria-autocomplete="list"
            autoComplete="off"
            spellCheck={false}
            placeholder="Search pages and automations..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            className="border-0 pl-9 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
          />
        </div>

        <div
          ref={listRef}
          id={LISTBOX_ID}
          role="listbox"
          aria-label="Pages and automations"
          className="max-h-[min(60vh,20rem)] overflow-y-auto p-2"
        >
          {items.length === 0 ? (
            <p className="px-2 py-6 text-center text-sm text-muted-foreground">
              No pages or automations match &ldquo;{query.trim()}&rdquo;.
            </p>
          ) : (
            groups.map((group) => (
              <div key={group.id} role="group" aria-labelledby={group.id}>
                <div
                  id={group.id}
                  className="px-2 pb-1 pt-2 text-xs font-medium text-muted-foreground"
                >
                  {group.label}
                </div>
                {group.items.map((item) => {
                  const isActive = item.id === activeItem?.id;
                  return (
                    <div
                      key={item.id}
                      id={item.id}
                      role="option"
                      aria-selected={isActive}
                      onMouseMove={() => setActiveId(item.id)}
                      onClick={() => handleSelect(item)}
                      className={cn(
                        'flex cursor-pointer items-center gap-2 rounded-md px-2 py-2 text-sm',
                        isActive && 'bg-accent text-accent-foreground'
                      )}
                    >
                      <item.icon className="h-4 w-4 shrink-0 text-muted-foreground" />
                      <span className="truncate">{item.label}</span>
                      {item.hint && (
                        <span className="ml-auto shrink-0 pl-2 text-xs text-muted-foreground">
                          {item.hint}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
