import prisma from '../prisma';
import { AppError } from '../utils/errors';
import fs from 'fs';
import path from 'path';
import { createNotification } from './notifications.service';

export async function addComment(taskId: string, content: string, userId: string) {
  const task = await prisma.task.findUnique({ where: { id: taskId } });
  if (!task) throw new AppError('Task not found', 404);

  const membership = await prisma.teamMember.findUnique({
    where: { teamId_userId: { teamId: task.teamId, userId } },
  });
  if (!membership) throw new AppError('You are not a member of this team', 403);

  const comment = await prisma.comment.create({
    data: { content, taskId, userId },
    include: {
      user: { select: { id: true, name: true, email: true } },
    },
  });

  if (task.assignedTo && task.assignedTo !== userId) {
    createNotification(
      'comment_added',
      `New comment on "${task.title}"`,
      task.assignedTo,
      taskId,
      userId,
    ).catch(() => {});
  }

  if (task.createdBy !== userId && task.createdBy !== task.assignedTo) {
    createNotification(
      'comment_added',
      `New comment on "${task.title}"`,
      task.createdBy,
      taskId,
      userId,
    ).catch(() => {});
  }

  return comment;
}

export async function getComments(taskId: string, userId: string) {
  const task = await prisma.task.findUnique({ where: { id: taskId } });
  if (!task) throw new AppError('Task not found', 404);

  const membership = await prisma.teamMember.findUnique({
    where: { teamId_userId: { teamId: task.teamId, userId } },
  });
  if (!membership) throw new AppError('You are not a member of this team', 403);

  return prisma.comment.findMany({
    where: { taskId },
    orderBy: { createdAt: 'desc' },
    include: {
      user: { select: { id: true, name: true, email: true } },
    },
  });
}

export async function deleteComment(commentId: string, userId: string) {
  const comment = await prisma.comment.findUnique({ where: { id: commentId } });
  if (!comment) throw new AppError('Comment not found', 404);

  if (comment.userId !== userId) {
    const task = await prisma.task.findUnique({ where: { id: comment.taskId } });
    const membership = await prisma.teamMember.findUnique({
      where: { teamId_userId: { teamId: task!.teamId, userId } },
    });
    if (!membership || (membership.role !== 'OWNER' && membership.role !== 'ADMIN')) {
      throw new AppError('You can only delete your own comments', 403);
    }
  }

  await prisma.comment.delete({ where: { id: commentId } });
}

export async function addAttachment(
  taskId: string,
  file: Express.Multer.File,
  userId: string,
) {
  const task = await prisma.task.findUnique({ where: { id: taskId } });
  if (!task) throw new AppError('Task not found', 404);

  const membership = await prisma.teamMember.findUnique({
    where: { teamId_userId: { teamId: task.teamId, userId } },
  });
  if (!membership) throw new AppError('You are not a member of this team', 403);

  return prisma.attachment.create({
    data: {
      filename: file.originalname,
      url: `/uploads/${file.filename}`,
      mimeType: file.mimetype,
      size: file.size,
      taskId,
      uploadedBy: userId,
    },
  });
}

export async function getAttachments(taskId: string, userId: string) {
  const task = await prisma.task.findUnique({ where: { id: taskId } });
  if (!task) throw new AppError('Task not found', 404);

  const membership = await prisma.teamMember.findUnique({
    where: { teamId_userId: { teamId: task.teamId, userId } },
  });
  if (!membership) throw new AppError('You are not a member of this team', 403);

  return prisma.attachment.findMany({
    where: { taskId },
    orderBy: { createdAt: 'desc' },
    include: {
      uploader: { select: { id: true, name: true, email: true } },
    },
  });
}

export async function deleteAttachment(attachmentId: string, userId: string) {
  const attachment = await prisma.attachment.findUnique({
    where: { id: attachmentId },
  });
  if (!attachment) throw new AppError('Attachment not found', 404);

  if (attachment.uploadedBy !== userId) {
    const task = await prisma.task.findUnique({ where: { id: attachment.taskId } });
    const membership = await prisma.teamMember.findUnique({
      where: { teamId_userId: { teamId: task!.teamId, userId } },
    });
    if (!membership || (membership.role !== 'OWNER' && membership.role !== 'ADMIN')) {
      throw new AppError('You can only delete your own attachments', 403);
    }
  }

  await prisma.attachment.delete({ where: { id: attachmentId } });

  const filePath = path.join(__dirname, '../..', attachment.url);
  fs.unlink(filePath, () => {});
}