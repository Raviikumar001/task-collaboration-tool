import { z } from 'zod';

export const updateUserSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  email: z.string().email().optional(),
  password: z.string().min(6).optional(),
  currentPassword: z.string().optional(),
}).refine(
  (data) => {
    if (data.password && !data.currentPassword) {
      return false;
    }
    return true;
  },
  { message: 'Current password is required when changing password', path: ['currentPassword'] },
);

export type UpdateUserInput = z.infer<typeof updateUserSchema>;
