'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { config } from '@/lib/config';
import { cn } from '@/lib/utils';
import { 
  LayoutDashboard, 
  ListTodo, 
  GitBranch, 
  ShieldCheck, 
  FileText,
  LogOut 
} from 'lucide-react';
import { useAuthStore } from '@/lib/auth/store';
import { Button } from '@/components/ui/button';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Actions', href: '/actions', icon: ListTodo },
  { name: 'Workflows', href: '/workflows', icon: GitBranch },
  { name: 'Approvals', href: '/approvals', icon: ShieldCheck },
  { name: 'Audit', href: '/audit', icon: FileText },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();
  
  return (
    <div className="flex h-full w-64 flex-col border-r bg-background">
      {/* Logo/App Name - Dynamic from config */}
      <div className="flex h-16 items-center border-b px-6">
        <span className="text-lg font-semibold">{config.app.name}</span>
        <span className="ml-2 text-xs text-muted-foreground">v{config.app.version}</span>
      </div>
      
      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                isActive 
                  ? "bg-primary/10 text-primary font-medium" 
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.name}
            </Link>
          );
        })}
      </nav>
      
      {/* User Info + Logout */}
      <div className="border-t p-4">
        {user && (
          <div className="mb-3">
            <p className="text-sm font-medium">{user.email}</p>
            <p className="text-xs text-muted-foreground capitalize">{user.role}</p>
          </div>
        )}
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full"
          onClick={() => {
            logout();
            window.location.href = '/login';
          }}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Sign Out
        </Button>
      </div>
    </div>
  );
}