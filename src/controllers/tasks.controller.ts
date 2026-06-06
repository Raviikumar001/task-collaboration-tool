import { Request, Response, NextFunction } from 'express';
import * as tasksService from '../services/tasks.service';
import { sendSuccess, sendPaginated } from '../utils/response';

export async function createTask(req: Request, res: Response, next: NextFunction) {
  try {
    const task = await tasksService.createTask(req.body, req.user!.id);
    sendSuccess(res, task, 201);
  } catch (err) {
    next(err);
  }
}

export async function getTasks(req: Request, res: Response, next: NextFunction) {
  try {
    const {
      status,
      priority,
      assignedTo,
      teamId,
      search,
      sort,
      order,
      page,
      limit,
    } = req.query;

    const result = await tasksService.getTasks(req.user!.id, {
      status: status as string,
      priority: priority as string,
      assignedTo: assignedTo as string,
      teamId: teamId as string,
      search: search as string,
      sort: sort as string,
      order: order as string,
      page: page ? parseInt(page as string) : undefined,
      limit: limit ? parseInt(limit as string) : undefined,
    });

    sendPaginated(res, result.tasks, result.total, result.page, result.limit);
  } catch (err) {
    next(err);
  }
}

export async function getTask(req: Request, res: Response, next: NextFunction) {
  try {
    const task = await tasksService.getTaskById(req.params.id, req.user!.id);
    sendSuccess(res, task);
  } catch (err) {
    next(err);
  }
}

export async function updateTask(req: Request, res: Response, next: NextFunction) {
  try {
    const task = await tasksService.updateTask(req.params.id, req.body, req.user!.id);
    sendSuccess(res, task);
  } catch (err) {
    next(err);
  }
}

export async function deleteTask(req: Request, res: Response, next: NextFunction) {
  try {
    await tasksService.deleteTask(req.params.id, req.user!.id);
    sendSuccess(res, { message: 'Task deleted successfully' });
  } catch (err) {
    next(err);
  }
}

export async function assignTask(req: Request, res: Response, next: NextFunction) {
  try {
    const task = await tasksService.assignTask(req.params.id, req.body.userId, req.user!.id);
    sendSuccess(res, task);
  } catch (err) {
    next(err);
  }
}

export async function updateStatus(req: Request, res: Response, next: NextFunction) {
  try {
    const task = await tasksService.updateTaskStatus(
      req.params.id,
      req.body.status,
      req.user!.id,
    );
    sendSuccess(res, task);
  } catch (err) {
    next(err);
  }
}
