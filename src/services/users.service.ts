import prisma from '../prisma';
import { AppError } from '../utils/errors';
import { hashPassword } from '../utils/password';
import { UpdateUserInput } from '../validators/users.validator';

export async function getUserById(id: string) {
  const user = await prisma.user.findUnique({
    where: { id },
    select: { id: true, name: true, email: true, createdAt: true, updatedAt: true },
  });

  if (!user) {
    throw new AppError('User not found', 404);
  }

  return user;
}

export async function updateUser(id: string, data: UpdateUserInput) {
  const updateData: Record<string, unknown> = {};

  if (data.name) updateData.name = data.name;
  if (data.email) updateData.email = data.email;
  if (data.password) updateData.password = await hashPassword(data.password);

  const user = await prisma.user.update({
    where: { id },
    data: updateData,
    select: { id: true, name: true, email: true, createdAt: true, updatedAt: true },
  });

  return user;
}
