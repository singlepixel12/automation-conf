import { useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, Bot, CalendarClock, Settings, Database, X, PanelLeftClose, PanelLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';

const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/automations', label: 'Automations', icon: Bot },
  { to: '/scheduling', label: 'Scheduling', icon: CalendarClock },
];

interface AppSidebarProps {
  open: boolean;
  onClose: () => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

export function AppSidebar({ open, onClose, collapsed, onToggleCollapse }: AppSidebarProps) {
  const location = useLocation();

  // Close sidebar on route change (mobile)
  useEffect(() => {
    onClose();
  }, [location.pathname, onClose]);

  return (
    <>
      {/* Mobile overlay backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          'bg-sidebar-background flex flex-col h-screen sticky top-0 shrink-0 transition-all duration-200 ease-in-out',
          collapsed ? 'w-16' : 'w-64',
          // Mobile: fixed overlay, hidden by default
          'fixed z-50 lg:static',
          open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        <div className={cn('flex items-center justify-between', collapsed ? 'p-3' : 'p-6')}>
          <div className={cn('flex items-center gap-2 min-w-0', collapsed && 'justify-center w-full')}>
            <Database className="h-6 w-6 text-primary shrink-0" />
            {!collapsed && (
              <div className="min-w-0">
                <h1 className="text-lg font-bold leading-tight">Config Hub</h1>
                <p className="text-xs text-muted-foreground mt-0.5">Automation Configuration</p>
              </div>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden h-8 w-8 shrink-0"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <Separator />
        <nav className={cn('flex-1 space-y-1', collapsed ? 'p-2' : 'p-4')}>
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              title={collapsed ? item.label : undefined}
              className={({ isActive }) =>
                cn(
                  'flex items-center rounded-md text-sm font-medium transition-colors',
                  collapsed ? 'justify-center p-2' : 'gap-3 px-3 py-2',
                  isActive
                    ? 'bg-accent text-accent-foreground'
                    : 'text-sidebar-muted-foreground hover:bg-accent hover:text-accent-foreground'
                )
              }
            >
              <item.icon className="h-4 w-4 shrink-0" />
              {!collapsed && item.label}
            </NavLink>
          ))}
        </nav>
        <Separator />
        <div className={collapsed ? 'p-2' : 'p-4'}>
          {!collapsed && (
            <>
              <div
                className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-muted-foreground/50 cursor-default"
                title="Coming soon"
              >
                <Settings className="h-4 w-4" />
                <span>Settings</span>
                <span className="ml-auto text-[10px] uppercase tracking-wider opacity-70">Soon</span>
              </div>
              <p className="px-3 mt-2 text-xs text-muted-foreground">v0.1.0 - PoC</p>
            </>
          )}
          {collapsed && (
            <div
              className="flex justify-center rounded-md p-2 text-muted-foreground/50 cursor-default"
              title="Settings - Coming soon"
            >
              <Settings className="h-4 w-4" />
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleCollapse}
            className={cn(
              'hidden lg:flex items-center gap-2 mt-2 w-full text-muted-foreground hover:text-foreground',
              collapsed ? 'justify-center px-2' : 'px-3'
            )}
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? (
              <PanelLeft className="h-4 w-4" />
            ) : (
              <>
                <PanelLeftClose className="h-4 w-4" />
                <span className="text-xs">Collapse</span>
              </>
            )}
          </Button>
        </div>
      </aside>
    </>
  );
}
