import prisma from '../prisma';
import { AppError } from '../utils/errors';

export async function createTeam(name: string, description: string | undefined, userId: string) {
  const team = await prisma.team.create({
    data: {
      name,
      description,
      createdBy: userId,
      members: {
        create: { userId, role: 'OWNER' },
      },
    },
    include: {
      members: {
        include: { user: { select: { id: true, name: true, email: true } } },
      },
    },
  });

  return team;
}

export async function getUserTeams(userId: string) {
  const memberships = await prisma.teamMember.findMany({
    where: { userId },
    include: {
      team: {
        include: {
          _count: { select: { members: true, tasks: true } },
        },
      },
    },
  });

  return memberships.map((m) => ({
    ...m.team,
    role: m.role,
  }));
}

export async function getTeamById(teamId: string, userId: string) {
  const team = await prisma.team.findUnique({
    where: { id: teamId },
    include: {
      members: {
        include: { user: { select: { id: true, name: true, email: true } } },
      },
      _count: { select: { tasks: true } },
    },
  });

  if (!team) throw new AppError('Team not found', 404);

  const isMember = team.members.some((m) => m.userId === userId);
  if (!isMember) throw new AppError('You are not a member of this team', 403);

  return team;
}

export async function addMember(teamId: string, email: string, role: string | undefined, userId: string) {
  const team = await prisma.team.findUnique({ where: { id: teamId } });
  if (!team) throw new AppError('Team not found', 404);

  const requesterMembership = await prisma.teamMember.findUnique({
    where: { teamId_userId: { teamId, userId } },
  });
  if (!requesterMembership || (requesterMembership.role !== 'OWNER' && requesterMembership.role !== 'ADMIN')) {
    throw new AppError('Only team owners or admins can add members', 403);
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new AppError('User not found with this email', 404);

  const existing = await prisma.teamMember.findUnique({
    where: { teamId_userId: { teamId, userId: user.id } },
  });
  if (existing) throw new AppError('User is already a member of this team', 409);

  const membership = await prisma.teamMember.create({
    data: {
      teamId,
      userId: user.id,
      role: (role as 'ADMIN' | 'MEMBER') || 'MEMBER',
    },
    include: {
      user: { select: { id: true, name: true, email: true } },
    },
  });

  return membership;
}

export async function removeMember(teamId: string, memberUserId: string, requesterId: string) {
  const team = await prisma.team.findUnique({ where: { id: teamId } });
  if (!team) throw new AppError('Team not found', 404);

  if (team.createdBy === memberUserId) {
    throw new AppError('Cannot remove the team owner', 400);
  }

  const requesterMembership = await prisma.teamMember.findUnique({
    where: { teamId_userId: { teamId, userId: requesterId } },
  });
  if (!requesterMembership || (requesterMembership.role !== 'OWNER' && requesterMembership.role !== 'ADMIN')) {
    throw new AppError('Only team owners or admins can remove members', 403);
  }

  await prisma.teamMember.delete({
    where: { teamId_userId: { teamId, userId: memberUserId } },
  });
}

export async function updateMemberRole(
  teamId: string,
  memberUserId: string,
  role: 'ADMIN' | 'MEMBER',
  requesterId: string,
) {
  const team = await prisma.team.findUnique({ where: { id: teamId } });
  if (!team) throw new AppError('Team not found', 404);

  if (team.createdBy === memberUserId) {
    throw new AppError('Cannot change the team owner role', 400);
  }

  const requesterMembership = await prisma.teamMember.findUnique({
    where: { teamId_userId: { teamId, userId: requesterId } },
  });
  if (!requesterMembership || requesterMembership.role !== 'OWNER') {
    throw new AppError('Only team owners can change member roles', 403);
  }

  return prisma.teamMember.update({
    where: { teamId_userId: { teamId, userId: memberUserId } },
    data: { role },
    include: {
      user: { select: { id: true, name: true, email: true } },
    },
  });
}
