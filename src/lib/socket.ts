import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { config } from '../config/env';
import { AuthPayload } from '../middleware/auth';

let io: Server;

const userSockets = new Map<string, Set<string>>();

export function initSocket(httpServer: HttpServer) {
  io = new Server(httpServer, {
    cors: {
      origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:5173'],
      credentials: true,
    },
  });

  io.on('connection', (socket: Socket) => {
    const token = socket.handshake.auth.token as string;
    if (!token) {
      socket.disconnect();
      return;
    }

    try {
      const decoded = jwt.verify(token, config.JWT_SECRET) as AuthPayload;
      const userId = decoded.id;

      if (!userSockets.has(userId)) {
        userSockets.set(userId, new Set());
      }
      userSockets.get(userId)!.add(socket.id);

      socket.join(`user:${userId}`);

      socket.on('disconnect', () => {
        const sockets = userSockets.get(userId);
        if (sockets) {
          sockets.delete(socket.id);
          if (sockets.size === 0) userSockets.delete(userId);
        }
      });
    } catch {
      socket.disconnect();
    }
  });

  return io;
}

export function getIO(): Server {
  if (!io) throw new Error('Socket.io not initialized');
  return io;
}

export function notifyUser(
  userId: string,
  event: string,
  data: unknown,
) {
  if (!io) return;
  io.to(`user:${userId}`).emit(event, data);
}

export function notifyTeam(
  teamId: string,
  event: string,
  data: unknown,
  excludeUserId?: string,
) {
  if (!io) return;
  if (excludeUserId) {
    io.to(`user:${excludeUserId}`).except(`user:${excludeUserId}`).emit(event, data);
  }
  // Broadcast to the team room if we have one, otherwise notify individually
  io.emit(event, data); // Fallback: notify all connected (team rooms are TODO)
}
