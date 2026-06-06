'use client';

import { useState, useRef, useEffect } from 'react';
import { useNotifications, useUnreadCount, useMarkAsRead, useMarkAllAsRead } from '@/hooks/use-notifications';
import { useAuth } from '@/providers/auth-provider';
import { Bell } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export function NotificationBell() {
  const { user } = useAuth();
  const { data: unreadCount } = useUnreadCount();
  const { data: notifications } = useNotifications();
  const markAsRead = useMarkAsRead();
  const markAllAsRead = useMarkAllAsRead();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  if (!user) return null;

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
      >
        <Bell className="w-5 h-5" />
        {unreadCount && unreadCount > 0 ? (
          <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        ) : null}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-200 z-50 max-h-96 overflow-y-auto">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <h3 className="font-semibold text-sm">Notifications</h3>
            {unreadCount && unreadCount > 0 ? (
              <button
                onClick={() => markAllAsRead.mutate()}
                className="text-xs text-blue-600 hover:underline"
              >
                Mark all read
              </button>
            ) : null}
          </div>
          {notifications && notifications.length > 0 ? (
            <div className="divide-y divide-gray-50">
              {notifications.map((n) => (
                <div
                  key={n.id}
                  className={cn(
                    'px-4 py-3 hover:bg-gray-50 transition-colors cursor-pointer',
                    !n.read && 'bg-blue-50/50',
                  )}
                  onClick={() => {
                    if (!n.read) markAsRead.mutate(n.id);
                    setOpen(false);
                  }}
                >
                  {n.taskId ? (
                    <Link href={`/tasks/${n.taskId}`} className="block">
                      <p className="text-sm text-gray-900">{n.message}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {format(new Date(n.createdAt), 'MMM d, h:mm a')}
                      </p>
                    </Link>
                  ) : (
                    <>
                      <p className="text-sm text-gray-900">{n.message}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {format(new Date(n.createdAt), 'MMM d, h:mm a')}
                      </p>
                    </>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400 text-center py-6">No notifications</p>
          )}
        </div>
      )}
    </div>
  );
}
