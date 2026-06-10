import { z } from 'zod';

export const createTaskSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  description: z.string().optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).optional(),
  dueDate: z.string().datetime().optional(),
  teamId: z.string().uuid('Invalid team ID'),
  assignedTo: z.string().uuid().optional(),
});

export const updateTaskSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().optional(),
  status: z.enum(['OPEN', 'IN_PROGRESS', 'COMPLETED']).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).optional(),
  dueDate: z.string().datetime().nullable().optional(),
  assignedTo: z.string().uuid().nullable().optional(),
});

export const assignTaskSchema = z.object({
  userId: z.string().uuid('Invalid user ID').nullable().optional(),
});

export const statusSchema = z.object({
  status: z.enum(['OPEN', 'IN_PROGRESS', 'COMPLETED']),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
