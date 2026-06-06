import { Request, Response, NextFunction } from 'express';
import * as commentsService from '../services/comments.service';
import { sendSuccess } from '../utils/response';
import { AppError } from '../utils/errors';

export async function addComment(req: Request, res: Response, next: NextFunction) {
  try {
    const comment = await commentsService.addComment(
      req.params.taskId,
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
    const comments = await commentsService.getComments(req.params.taskId, req.user!.id);
    sendSuccess(res, comments);
  } catch (err) {
    next(err);
  }
}

export async function deleteComment(req: Request, res: Response, next: NextFunction) {
  try {
    await commentsService.deleteComment(req.params.commentId, req.user!.id);
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
      req.params.taskId,
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
      req.params.taskId,
      req.user!.id,
    );
    sendSuccess(res, attachments);
  } catch (err) {
    next(err);
  }
}

export async function deleteAttachment(req: Request, res: Response, next: NextFunction) {
  try {
    await commentsService.deleteAttachment(req.params.attachmentId, req.user!.id);
    sendSuccess(res, { message: 'Attachment deleted successfully' });
  } catch (err) {
    next(err);
  }
}
