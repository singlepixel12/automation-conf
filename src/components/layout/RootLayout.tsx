import { useCallback, useEffect, useRef, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { AppSidebar } from './AppSidebar';
import { Header } from './Header';
import { CommandPalette } from './CommandPalette';
import { Toaster } from '@/components/ui/toaster';

/**
 * Anything that owns text entry - form fields, ag-Grid cell editors, the cron
 * editor, config key/value inputs, the Automations search box. The global
 * shortcut must never consume a keystroke aimed at one of these.
 */
function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  if (target.isContentEditable) return true;
  const tag = target.tagName;
  return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT';
}

export function RootLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const restoreFocusRef = useRef<HTMLElement | null>(null);

  const handleSidebarClose = useCallback(() => {
    setSidebarOpen(false);
  }, []);

  const openPalette = useCallback(() => {
    const active = document.activeElement;
    restoreFocusRef.current = active instanceof HTMLElement ? active : null;
    setPaletteOpen(true);
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented || event.repeat) return;
      if (!(event.metaKey || event.ctrlKey) || event.altKey || event.shiftKey) return;
      if (event.key.toLowerCase() !== 'k') return;
      // Already open: re-capturing focus here would overwrite the element we
      // owe focus back to (e.g. when focus sits on the dialog close button).
      if (paletteOpen) return;
      if (isEditableTarget(event.target)) return;
      event.preventDefault();
      openPalette();
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [openPalette, paletteOpen]);

  return (
    <div className="flex min-h-screen">
      {/* Wrapper stretches full content height so border-r never stops short */}
      <div className="border-r border-sidebar-border shrink-0">
        <AppSidebar
          open={sidebarOpen}
          onClose={handleSidebarClose}
          collapsed={collapsed}
          onToggleCollapse={() => setCollapsed((c) => !c)}
        />
      </div>
      <div className="flex-1 flex flex-col min-w-0">
        <Header onMenuClick={() => setSidebarOpen(true)} onCommandPaletteOpen={openPalette} />
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
      <CommandPalette
        open={paletteOpen}
        onOpenChange={setPaletteOpen}
        restoreFocusRef={restoreFocusRef}
      />
      <Toaster />
    </div>
  );
}
