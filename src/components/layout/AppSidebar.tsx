import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Store,
  ShieldCheck,
  Package,
  Sparkles,
  FileText,
  Rss,
  Swords,
  Settings,
  ChevronDown,
  Menu,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/store/useAppStore';
import { Button } from '@/components/ui/button';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { useState } from 'react';

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  roles?: string[];
  children?: { label: string; href: string }[];
}

const navItems: NavItem[] = [
  { label: 'Dashboard', href: '/', icon: LayoutDashboard },
  { label: 'Lojas (Wave 1)', href: '/stores', icon: Store, roles: ['admin', 'cadastro'] },
  { label: 'Gates & Evidências', href: '/gates', icon: ShieldCheck, roles: ['admin', 'cadastro', 'auditor'] },
  { label: 'Produtos (PIM)', href: '/products', icon: Package, roles: ['admin', 'catalogo'] },
  { label: 'AI Studio', href: '/ai-studio', icon: Sparkles, roles: ['admin', 'catalogo'] },
  { label: 'Anúncios', href: '/listings', icon: FileText, roles: ['admin', 'catalogo'] },
  { label: 'Merchant Center', href: '/merchant', icon: Rss, roles: ['admin', 'catalogo'] },
  { label: 'War Room', href: '/war-room', icon: Swords },
  { label: 'Configurações', href: '/settings', icon: Settings, roles: ['admin'] },
];

interface AppSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function AppSidebar({ collapsed, onToggle }: AppSidebarProps) {
  const location = useLocation();
  const { currentUser, workspace } = useAppStore();

  const isActive = (href: string) => {
    if (href === '/') return location.pathname === '/';
    return location.pathname.startsWith(href);
  };

  const canAccess = (item: NavItem) => {
    if (!item.roles) return true;
    if (currentUser.role === 'admin') return true;
    return item.roles.includes(currentUser.role);
  };

  return (
    <aside
      className={cn(
        'flex flex-col border-r bg-sidebar transition-all duration-300',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Header */}
      <div className="flex h-14 items-center border-b px-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggle}
          className="shrink-0"
        >
          <Menu className="h-5 w-5" />
        </Button>
        {!collapsed && (
          <div className="ml-3 overflow-hidden">
            <h2 className="truncate text-sm font-semibold text-foreground">
              {workspace.tradeName}
            </h2>
            <p className="truncate text-xs text-muted-foreground">
              Launch OS
            </p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-2">
        <ul className="space-y-1">
          {navItems.map((item) => {
            if (!canAccess(item)) return null;
            
            const active = isActive(item.href);
            const Icon = item.icon;

            return (
              <li key={item.href}>
                <Link
                  to={item.href}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                    active
                      ? 'bg-primary text-primary-foreground'
                      : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                    collapsed && 'justify-center px-2'
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {!collapsed && <span className="truncate">{item.label}</span>}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      {!collapsed && (
        <div className="border-t p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground">
              {currentUser.name.charAt(0)}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="truncate text-sm font-medium">{currentUser.name}</p>
              <p className="truncate text-xs text-muted-foreground capitalize">
                {currentUser.role}
              </p>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
