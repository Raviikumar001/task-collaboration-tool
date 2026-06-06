'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuth } from '@/providers/auth-provider';
import {
  LayoutDashboard,
  CheckSquare,
  Users,
  User,
  LogOut,
  Menu,
  X,
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { NotificationBell } from '@/components/notifications/notification-bell';

function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const links = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/tasks', label: 'Tasks', icon: CheckSquare },
    { href: '/teams', label: 'Teams', icon: Users },
    { href: '/profile', label: 'Profile', icon: User },
  ];

  const sidebarContent = (
    <div className="flex flex-col h-full">
      <div className="px-6 py-5 border-b border-gray-100">
        <h1 className="text-xl font-bold text-gray-900">TaskTracker</h1>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-1">
        {links.map((link) => {
          const Icon = link.icon;
          const active = pathname === link.href || pathname.startsWith(link.href + '/');
          return (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                active
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
              )}
            >
              <Icon className="w-5 h-5" />
              {link.label}
            </Link>
          );
        })}
      </nav>
      <div className="px-3 py-4 border-t border-gray-100">
        <div className="px-3 py-2 mb-2">
          <p className="text-sm font-medium text-gray-900 truncate">{user?.name}</p>
          <p className="text-xs text-gray-500 truncate">{user?.email}</p>
        </div>
        <button
          onClick={logout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <>
      <button
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-white shadow-md border"
        onClick={() => setMobileOpen(!mobileOpen)}
      >
        {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>
      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setMobileOpen(false)} />
      )}
      <aside
        className={cn(
          'fixed lg:sticky top-0 left-0 z-40 h-screen w-64 bg-white border-r border-gray-200 flex flex-col transition-transform',
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
        )}
      >
        {sidebarContent}
      </aside>
    </>
  );
}

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-6 lg:p-8 pt-16 lg:pt-8">
        <div className="fixed top-4 right-4 z-50">
          <NotificationBell />
        </div>
        {children}
      </main>
    </div>
  );
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <AuthGuard>{children}</AuthGuard>;
}
