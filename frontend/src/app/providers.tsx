'use client';

import { AuthProvider } from '@/providers/auth-provider';
import { QueryProvider } from '@/providers/query-provider';
import { Toaster } from 'sonner';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryProvider>
      <AuthProvider>
        <Toaster position="top-right" richColors />
        {children}
      </AuthProvider>
    </QueryProvider>
  );
}
