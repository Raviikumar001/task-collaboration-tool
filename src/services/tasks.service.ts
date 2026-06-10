import prisma from '../prisma';
import { AppError } from '../utils/errors';
import { CreateTaskInput, UpdateTaskInput } from '../validators/tasks.validator';
import { Prisma } from '@prisma/client';
import { createNotification } from './notifications.service';

export async function createTask(data: CreateTaskInput, createdBy: string) {
  const membership = await prisma.teamMember.findUnique({
    where: { teamId_userId: { teamId: data.teamId, userId: createdBy } },
  });

  if (!membership) {
    throw new AppError('You are not a member of this team', 403);
  }

  if (data.assignedTo) {
    const assigneeMembership = await prisma.teamMember.findUnique({
      where: {
        teamId_userId: { teamId: data.teamId, userId: data.assignedTo },
      },
    });
    if (!assigneeMembership) {
      throw new AppError('Assignee is not a member of this team', 400);
    }
  }

  return prisma.task.create({
    data: {
      title: data.title,
      description: data.description,
      priority: data.priority,
      dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
      teamId: data.teamId,
      assignedTo: data.assignedTo,
      createdBy,
    },
    include: {
      assignee: { select: { id: true, name: true, email: true } },
      creator: { select: { id: true, name: true, email: true } },
      team: { select: { id: true, name: true } },
    },
  });
}

export async function getTasks(
  userId: string,
  filters: {
    status?: string;
    priority?: string;
    assignedTo?: string;
    teamId?: string;
    search?: string;
    sort?: string;
    order?: string;
    page?: number;
    limit?: number;
  },
) {
  const page = filters.page || 1;
  const limit = filters.limit || 10;
  const skip = (page - 1) * limit;

  const memberTeams = await prisma.teamMember.findMany({
    where: { userId },
    select: { teamId: true },
  });

  const teamIds = memberTeams.map((m) => m.teamId);

  const where: Prisma.TaskWhereInput = {
    teamId: filters.teamId ? filters.teamId : { in: teamIds },
  };

  if (filters.status) {
    where.status = filters.status as 'OPEN' | 'IN_PROGRESS' | 'COMPLETED';
  }
  if (filters.priority) {
    where.priority = filters.priority as 'LOW' | 'MEDIUM' | 'HIGH';
  }
  if (filters.assignedTo) {
    where.assignedTo = filters.assignedTo;
  }
  if (filters.search) {
    where.OR = [
      { title: { contains: filters.search, mode: 'insensitive' } },
      { description: { contains: filters.search, mode: 'insensitive' } },
    ];
  }

  const orderBy: Prisma.TaskOrderByWithRelationInput = {};
  const sortField = filters.sort || 'createdAt';
  const sortOrder = (filters.order === 'asc' ? 'asc' : 'desc') as 'asc' | 'desc';

  if (['createdAt', 'updatedAt', 'dueDate', 'priority', 'status', 'title'].includes(sortField)) {
    (orderBy as Record<string, string>)[sortField] = sortOrder;
  }

  const [tasks, total] = await Promise.all([
    prisma.task.findMany({
      where,
      orderBy,
      skip,
      take: limit,
      include: {
        assignee: { select: { id: true, name: true, email: true } },
        creator: { select: { id: true, name: true, email: true } },
        team: { select: { id: true, name: true } },
        _count: { select: { comments: true, attachments: true } },
      },
    }),
    prisma.task.count({ where }),
  ]);

  return { tasks, total, page, limit };
}

export async function getTaskById(taskId: string, userId: string) {
  const task = await prisma.task.findUnique({
    where: { id: taskId },
    include: {
      assignee: { select: { id: true, name: true, email: true } },
      creator: { select: { id: true, name: true, email: true } },
      team: { select: { id: true, name: true } },
      _count: { select: { comments: true, attachments: true } },
    },
  });

  if (!task) {
    throw new AppError('Task not found', 404);
  }

  const membership = await prisma.teamMember.findUnique({
    where: { teamId_userId: { teamId: task.teamId, userId } },
  });

  if (!membership) {
    throw new AppError('You are not a member of this team', 403);
  }

  return task;
}

export async function updateTask(
  taskId: string,
  data: UpdateTaskInput,
  userId: string,
) {
  const task = await prisma.task.findUnique({ where: { id: taskId } });
  if (!task) throw new AppError('Task not found', 404);

  const membership = await prisma.teamMember.findUnique({
    where: { teamId_userId: { teamId: task.teamId, userId } },
  });
  if (!membership) throw new AppError('You are not a member of this team', 403);

  const updateData: Record<string, unknown> = {};
  if (data.title !== undefined) updateData.title = data.title;
  if (data.description !== undefined) updateData.description = data.description;
  if (data.status !== undefined) updateData.status = data.status;
  if (data.priority !== undefined) updateData.priority = data.priority;
  if (data.dueDate !== undefined) updateData.dueDate = data.dueDate ? new Date(data.dueDate) : null;
  if (data.assignedTo !== undefined) updateData.assignedTo = data.assignedTo;

  const updated = await prisma.task.update({
    where: { id: taskId },
    data: updateData,
    include: {
      assignee: { select: { id: true, name: true, email: true } },
      creator: { select: { id: true, name: true, email: true } },
      team: { select: { id: true, name: true } },
    },
  });

  if (data.assignedTo && data.assignedTo !== task.assignedTo) {
    createNotification(
      'task_assigned',
      `You were assigned to "${task.title}"`,
      data.assignedTo,
      taskId,
      userId,
    ).catch(() => {});
  }

  return updated;
}

export async function deleteTask(taskId: string, userId: string) {
  const task = await prisma.task.findUnique({ where: { id: taskId } });
  if (!task) throw new AppError('Task not found', 404);

  const membership = await prisma.teamMember.findUnique({
    where: { teamId_userId: { teamId: task.teamId, userId } },
  });

  if (!membership || (membership.role !== 'OWNER' && membership.role !== 'ADMIN')) {
    throw new AppError('Only team owners or admins can delete tasks', 403);
  }

  await prisma.task.delete({ where: { id: taskId } });
}

export async function assignTask(taskId: string, assigneeId: string | null, userId: string) {
  const task = await prisma.task.findUnique({ where: { id: taskId } });
  if (!task) throw new AppError('Task not found', 404);

  const membership = await prisma.teamMember.findUnique({
    where: { teamId_userId: { teamId: task.teamId, userId } },
  });
  if (!membership) throw new AppError('You are not a member of this team', 403);

  if (assigneeId) {
    const assigneeMembership = await prisma.teamMember.findUnique({
      where: { teamId_userId: { teamId: task.teamId, userId: assigneeId } },
    });
    if (!assigneeMembership) {
      throw new AppError('Assignee is not a member of this team', 400);
    }
  }

  const updated = await prisma.task.update({
    where: { id: taskId },
    data: { assignedTo: assigneeId ?? null },
    include: {
      assignee: { select: { id: true, name: true, email: true } },
      creator: { select: { id: true, name: true, email: true } },
      team: { select: { id: true, name: true } },
    },
  });

  if (assigneeId) {
    createNotification(
      'task_assigned',
      `You were assigned to "${task.title}"`,
      assigneeId,
      taskId,
      userId,
    ).catch(() => {});
  }

  return updated;
}

export async function updateTaskStatus(
  taskId: string,
  status: 'OPEN' | 'IN_PROGRESS' | 'COMPLETED',
  userId: string,
) {
  const task = await prisma.task.findUnique({ where: { id: taskId } });
  if (!task) throw new AppError('Task not found', 404);

  const membership = await prisma.teamMember.findUnique({
    where: { teamId_userId: { teamId: task.teamId, userId } },
  });
  if (!membership) throw new AppError('You are not a member of this team', 403);

  return prisma.task.update({
    where: { id: taskId },
    data: { status },
    include: {
      assignee: { select: { id: true, name: true, email: true } },
      creator: { select: { id: true, name: true, email: true } },
      team: { select: { id: true, name: true } },
    },
  });
}
