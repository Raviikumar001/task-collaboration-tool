'use client';

import { AuthProvider, useAuth } from '@/providers/auth-provider';
import { QueryProvider } from '@/providers/query-provider';
import { Toaster } from 'sonner';

function AuthLayoutInner({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      {children}
    </div>
  );
}

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <QueryProvider>
      <AuthProvider>
        <Toaster position="top-right" richColors />
        <AuthLayoutInner>{children}</AuthLayoutInner>
      </AuthProvider>
    </QueryProvider>
  );
}
