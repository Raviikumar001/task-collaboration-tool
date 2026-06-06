'use client';

import { AuthProvider } from '@/providers/auth-provider';
import { QueryProvider } from '@/providers/query-provider';
import { SocketProvider } from '@/providers/socket-provider';
import { Toaster } from 'sonner';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryProvider>
      <AuthProvider>
        <SocketProvider>
          <Toaster position="top-right" richColors />
          {children}
        </SocketProvider>
      </AuthProvider>
    </QueryProvider>
  );
}
