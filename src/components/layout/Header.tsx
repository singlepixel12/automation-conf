import { useLocation, Link } from 'react-router-dom';
import { ChevronRight, Menu } from 'lucide-react';
import { useAutomationStore } from '@/stores/automationStore';
import { ModeToggle } from '@/components/mode-toggle';
import { Button } from '@/components/ui/button';

interface HeaderProps {
  onMenuClick: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
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
        <ModeToggle />
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
