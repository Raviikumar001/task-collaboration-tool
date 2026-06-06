import prisma from '../prisma';
import { notifyUser } from '../lib/socket';

export async function createNotification(
  type: string,
  message: string,
  userId: string,
  taskId?: string,
  actorId?: string,
) {
  const notification = await prisma.notification.create({
    data: { type, message, userId, taskId, actorId },
  });

  notifyUser(userId, 'notification', notification);

  return notification;
}

export async function getUserNotifications(userId: string) {
  return prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });
}

export async function markAsRead(id: string, userId: string) {
  return prisma.notification.updateMany({
    where: { id, userId },
    data: { read: true },
  });
}

export async function markAllAsRead(userId: string) {
  return prisma.notification.updateMany({
    where: { userId, read: false },
    data: { read: true },
  });
}

export async function getUnreadCount(userId: string) {
  return prisma.notification.count({
    where: { userId, read: false },
  });
}
