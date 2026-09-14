import { useLocation, Link } from 'react-router-dom';
import { ChevronRight, Menu, Search } from 'lucide-react';
import { useAutomationStore } from '@/stores/automationStore';
import { ModeToggle } from '@/components/mode-toggle';
import { Button } from '@/components/ui/button';

/** Hint on the palette trigger. RootLayout accepts either modifier. */
const SHORTCUT_HINT =
  typeof navigator !== 'undefined' && /Mac|iPhone|iPad|iPod/.test(navigator.userAgent)
    ? '⌘K'
    : 'Ctrl K';

interface HeaderProps {
  onMenuClick: () => void;
  onCommandPaletteOpen: () => void;
}

export function Header({ onMenuClick, onCommandPaletteOpen }: HeaderProps) {
  const location = useLocation();
  const automations = useAutomationStore((s) => s.automations);

  const crumbs = buildBreadcrumbs(location.pathname, automations);

  return (
    <header className="border-b bg-background px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden h-8 w-8"
            onClick={onMenuClick}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <nav className="flex items-center gap-1 text-sm">
            {crumbs.map((crumb, i) => (
              <span key={crumb.path} className="flex items-center gap-1">
                {i > 0 && <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />}
                {i === crumbs.length - 1 ? (
                  <span className="font-medium text-foreground">{crumb.label}</span>
                ) : (
                  <Link to={crumb.path} className="text-muted-foreground hover:text-foreground transition-colors">
                    {crumb.label}
                  </Link>
                )}
              </span>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-2">
          {/* Global navigation - jumps to any page or automation. Distinct from
              the Automations page search box, which filters the grid in place. */}
          <Button
            variant="outline"
            size="sm"
            onClick={onCommandPaletteOpen}
            className="gap-2 text-muted-foreground"
            aria-label="Go to a page or automation"
          >
            <Search className="h-4 w-4" />
            <span className="hidden sm:inline">Go to...</span>
            <kbd className="hidden rounded border bg-muted px-1.5 py-0.5 text-[10px] font-medium md:inline">
              {SHORTCUT_HINT}
            </kbd>
          </Button>
          <ModeToggle />
        </div>
      </div>
    </header>
  );
}

function buildBreadcrumbs(pathname: string, automations: { id: string; name: string }[]) {
  const crumbs: { label: string; path: string }[] = [];

  if (pathname === '/') {
    crumbs.push({ label: 'Dashboard', path: '/' });
  } else if (pathname === '/automations') {
    crumbs.push({ label: 'Dashboard', path: '/' });
    crumbs.push({ label: 'Automations', path: '/automations' });
  } else if (pathname.startsWith('/automations/')) {
    const id = pathname.split('/')[2];
    const auto = automations.find((a) => a.id === id);
    crumbs.push({ label: 'Dashboard', path: '/' });
    crumbs.push({ label: 'Automations', path: '/automations' });
    crumbs.push({ label: auto?.name ?? id, path: pathname });
  }

  return crumbs;
}
