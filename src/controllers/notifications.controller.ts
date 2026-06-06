import { Request, Response, NextFunction } from 'express';
import * as notificationsService from '../services/notifications.service';
import { sendSuccess } from '../utils/response';
import { param } from '../middleware/auth';

export async function getNotifications(req: Request, res: Response, next: NextFunction) {
  try {
    const notifications = await notificationsService.getUserNotifications(req.user!.id);
    sendSuccess(res, notifications);
  } catch (err) {
    next(err);
  }
}

export async function markAsRead(req: Request, res: Response, next: NextFunction) {
  try {
    await notificationsService.markAsRead(param(req, 'id'), req.user!.id);
    sendSuccess(res, { message: 'Marked as read' });
  } catch (err) {
    next(err);
  }
}

export async function markAllAsRead(req: Request, res: Response, next: NextFunction) {
  try {
    await notificationsService.markAllAsRead(req.user!.id);
    sendSuccess(res, { message: 'All marked as read' });
  } catch (err) {
    next(err);
  }
}

export async function getUnreadCount(req: Request, res: Response, next: NextFunction) {
  try {
    const count = await notificationsService.getUnreadCount(req.user!.id);
    sendSuccess(res, { count });
  } catch (err) {
    next(err);
  }
}
