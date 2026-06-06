import { Request, Response, NextFunction } from 'express';
import * as usersService from '../services/users.service';
import { sendSuccess } from '../utils/response';
import { param } from '../middleware/auth';

export async function getUser(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await usersService.getUserById(param(req, 'id'));
    sendSuccess(res, user);
  } catch (err) {
    next(err);
  }
}

export async function updateUser(req: Request, res: Response, next: NextFunction) {
  try {
    if (req.user!.id !== param(req, 'id')) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }
    const user = await usersService.updateUser(param(req, 'id'), req.body);
    sendSuccess(res, user);
  } catch (err) {
    next(err);
  }
}
