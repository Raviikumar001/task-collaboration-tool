import { z } from 'zod';

export const updateUserSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  email: z.string().email().optional(),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password must be under 128 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one digit')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character')
    .optional(),
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
