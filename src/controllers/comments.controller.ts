import { Request, Response, NextFunction } from 'express';
import * as commentsService from '../services/comments.service';
import { sendSuccess, sendPaginated } from '../utils/response';
import { AppError } from '../utils/errors';
import { param } from '../middleware/auth';

export async function addComment(req: Request, res: Response, next: NextFunction) {
  try {
    const comment = await commentsService.addComment(
      param(req, 'taskId'),
      req.body.content,
      req.user!.id,
    );
    sendSuccess(res, comment, 201);
  } catch (err) {
    next(err);
  }
}

export async function getComments(req: Request, res: Response, next: NextFunction) {
  try {
    const page = req.query.page ? parseInt(req.query.page as string) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;
    const result = await commentsService.getComments(param(req, 'taskId'), req.user!.id, page, limit);
    sendPaginated(res, result.comments, result.total, page, limit);
  } catch (err) {
    next(err);
  }
}

export async function deleteComment(req: Request, res: Response, next: NextFunction) {
  try {
    await commentsService.deleteComment(param(req, 'commentId'), req.user!.id);
    sendSuccess(res, { message: 'Comment deleted successfully' });
  } catch (err) {
    next(err);
  }
}

export async function addAttachment(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.file) {
      throw new AppError('No file uploaded', 400);
    }

    const attachment = await commentsService.addAttachment(
      param(req, 'taskId'),
      req.file,
      req.user!.id,
    );
    sendSuccess(res, attachment, 201);
  } catch (err) {
    next(err);
  }
}

export async function getAttachments(req: Request, res: Response, next: NextFunction) {
  try {
    const attachments = await commentsService.getAttachments(
      param(req, 'taskId'),
      req.user!.id,
    );
    sendSuccess(res, attachments);
  } catch (err) {
    next(err);
  }
}

export async function deleteAttachment(req: Request, res: Response, next: NextFunction) {
  try {
    await commentsService.deleteAttachment(param(req, 'attachmentId'), req.user!.id);
    sendSuccess(res, { message: 'Attachment deleted successfully' });
  } catch (err) {
    next(err);
  }
}
