import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';

interface Comment {
  id: string;
  content: string;
  taskId: string;
  userId: string;
  createdAt: string;
  user: { id: string; name: string; email: string };
}

interface Attachment {
  id: string;
  filename: string;
  url: string;
  mimeType: string;
  size: number;
  taskId: string;
  uploadedBy: string;
  createdAt: string;
  uploader: { id: string; name: string; email: string };
}

export function useComments(taskId: string) {
  return useQuery({
    queryKey: ['comments', taskId],
    queryFn: async () => {
      const res = await api.get(`/tasks/${taskId}/comments`);
      return res.data.data as Comment[];
    },
    enabled: !!taskId,
  });
}

export function useAddComment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ taskId, content }: { taskId: string; content: string }) => {
      const res = await api.post(`/tasks/${taskId}/comments`, { content });
      return res.data.data;
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['comments', vars.taskId] });
      qc.invalidateQueries({ queryKey: ['task', vars.taskId] });
    },
  });
}

export function useDeleteComment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ taskId, commentId }: { taskId: string; commentId: string }) => {
      await api.delete(`/tasks/${taskId}/comments/${commentId}`);
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['comments', vars.taskId] });
      qc.invalidateQueries({ queryKey: ['task', vars.taskId] });
    },
  });
}

export function useAttachments(taskId: string) {
  return useQuery({
    queryKey: ['attachments', taskId],
    queryFn: async () => {
      const res = await api.get(`/tasks/${taskId}/comments/attachments`);
      return res.data.data as Attachment[];
    },
    enabled: !!taskId,
  });
}

export function useUploadAttachment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ taskId, file }: { taskId: string; file: File }) => {
      const formData = new FormData();
      formData.append('file', file);
      const res = await api.post(`/tasks/${taskId}/comments/attachments`, formData);
      return res.data.data;
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['attachments', vars.taskId] });
      qc.invalidateQueries({ queryKey: ['task', vars.taskId] });
    },
  });
}

export function useDeleteAttachment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ taskId, attachmentId }: { taskId: string; attachmentId: string }) => {
      await api.delete(`/tasks/${taskId}/comments/attachments/${attachmentId}`);
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['attachments', vars.taskId] });
      qc.invalidateQueries({ queryKey: ['task', vars.taskId] });
    },
  });
}
