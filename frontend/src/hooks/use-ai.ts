import { useMutation } from '@tanstack/react-query';
import api from '@/lib/api';

export function useGenerateDescription() {
  return useMutation({
    mutationFn: async (title: string) => {
      const res = await api.post('/ai/generate-description', { title });
      return res.data.data.description as string;
    },
  });
}
