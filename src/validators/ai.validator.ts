import { z } from 'zod';

export const generateDescriptionSchema = z.object({
  title: z.string().min(1, 'Task title is required').max(200),
});
