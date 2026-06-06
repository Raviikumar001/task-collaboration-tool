'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './auth-provider';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';

const SocketContext = createContext<Socket | null>(null);

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const qc = useQueryClient();

  useEffect(() => {
    if (!user) return;

    const token = document.cookie
      .split('; ')
      .find((row) => row.startsWith('token='))
      ?.split('=')[1];

    if (!token) return;

    const s = io('http://localhost:3000', {
      auth: { token },
      transports: ['websocket'],
    });

    s.on('notification', (notification: { id: string; type: string; message: string; taskId?: string }) => {
      toast.info(notification.message);
      qc.invalidateQueries({ queryKey: ['notifications'] });
    });

    setSocket(s);

    return () => {
      s.disconnect();
    };
  }, [user, qc]);

  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
}

export function useSocket() {
  return useContext(SocketContext);
}
