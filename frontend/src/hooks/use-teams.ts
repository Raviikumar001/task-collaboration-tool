import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';

interface Team {
  id: string;
  name: string;
  description: string | null;
  createdBy: string;
  createdAt: string;
  role?: string;
  members?: TeamMember[];
  _count?: { members: number; tasks: number };
}

interface TeamMember {
  id: string;
  userId: string;
  teamId: string;
  role: 'OWNER' | 'ADMIN' | 'MEMBER';
  user: { id: string; name: string; email: string };
}

export function useTeams() {
  return useQuery({
    queryKey: ['teams'],
    queryFn: async () => {
      const res = await api.get('/teams');
      return res.data.data as Team[];
    },
  });
}

export function useTeam(id: string) {
  return useQuery({
    queryKey: ['team', id],
    queryFn: async () => {
      const res = await api.get(`/teams/${id}`);
      return res.data.data as Team & { members: TeamMember[] };
    },
    enabled: !!id,
  });
}

export function useCreateTeam() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: { name: string; description?: string }) => {
      const res = await api.post('/teams', data);
      return res.data.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['teams'] }),
  });
}

export function useAddMember() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ teamId, email, role }: { teamId: string; email: string; role?: string }) => {
      const res = await api.post(`/teams/${teamId}/members`, { email, role });
      return res.data.data;
    },
    onSuccess: (_, vars) => qc.invalidateQueries({ queryKey: ['team', vars.teamId] }),
  });
}

export function useRemoveMember() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ teamId, userId }: { teamId: string; userId: string }) => {
      await api.delete(`/teams/${teamId}/members/${userId}`);
    },
    onSuccess: (_, vars) => qc.invalidateQueries({ queryKey: ['team', vars.teamId] }),
  });
}

export function useUpdateMemberRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ teamId, userId, role }: { teamId: string; userId: string; role: string }) => {
      const res = await api.patch(`/teams/${teamId}/members/${userId}`, { role });
      return res.data.data;
    },
    onSuccess: (_, vars) => qc.invalidateQueries({ queryKey: ['team', vars.teamId] }),
  });
}
