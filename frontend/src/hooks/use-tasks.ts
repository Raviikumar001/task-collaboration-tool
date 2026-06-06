import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';

interface Task {
  id: string;
  title: string;
  description: string | null;
  status: 'OPEN' | 'IN_PROGRESS' | 'COMPLETED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  dueDate: string | null;
  teamId: string;
  assignedTo: string | null;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  assignee: { id: string; name: string; email: string } | null;
  creator: { id: string; name: string; email: string };
  team: { id: string; name: string };
  _count?: { comments: number; attachments: number };
}

interface TaskFilters {
  status?: string;
  priority?: string;
  assignedTo?: string;
  teamId?: string;
  search?: string;
  sort?: string;
  order?: string;
  page?: number;
  limit?: number;
  enabled?: boolean;
}

export function useTasks(filters: TaskFilters = {}) {
  const { enabled, ...rest } = filters;
  return useQuery({
    queryKey: ['tasks', rest],
    queryFn: async () => {
      const params = new URLSearchParams();
      Object.entries(rest).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== '') params.set(k, String(v));
      });
      const res = await api.get(`/tasks?${params}`);
      return res.data;
    },
    enabled: enabled !== false,
  });
}

export function useTask(id: string) {
  return useQuery({
    queryKey: ['task', id],
    queryFn: async () => {
      const res = await api.get(`/tasks/${id}`);
      return res.data.data as Task;
    },
    enabled: !!id,
  });
}

export function useCreateTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      const res = await api.post('/tasks', data);
      return res.data.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tasks'] }),
  });
}

export function useUpdateTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: { id: string } & Record<string, unknown>) => {
      const res = await api.put(`/tasks/${id}`, data);
      return res.data.data;
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['tasks'] });
      qc.invalidateQueries({ queryKey: ['task', vars.id] });
    },
  });
}

export function useDeleteTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/tasks/${id}`);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tasks'] }),
  });
}

export function useAssignTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, userId }: { id: string; userId: string }) => {
      const res = await api.patch(`/tasks/${id}/assign`, { userId });
      return res.data.data;
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['tasks'] });
      qc.invalidateQueries({ queryKey: ['task', vars.id] });
    },
  });
}

export function useUpdateTaskStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const res = await api.patch(`/tasks/${id}/status`, { status });
      return res.data.data;
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['tasks'] });
      qc.invalidateQueries({ queryKey: ['task', vars.id] });
    },
  });
}
