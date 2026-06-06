'use client';

import { useRouter } from 'next/navigation';
import { useCreateTask } from '@/hooks/use-tasks';
import { useTeams } from '@/hooks/use-teams';
import { useGenerateDescription } from '@/hooks/use-ai';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Sparkles } from 'lucide-react';

interface TaskForm {
  title: string;
  description: string;
  priority: string;
  teamId: string;
  assignedTo: string;
  dueDate: string;
}

export default function NewTaskPage() {
  const router = useRouter();
  const createTask = useCreateTask();
  const { data: teams } = useTeams();
  const generateDescription = useGenerateDescription();
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<TaskForm>();

  const titleValue = watch('title');

  async function handleGenerateDescription() {
    if (!titleValue || titleValue.trim().length < 3) {
      toast.error('Enter a task title first (at least 3 characters)');
      return;
    }
    try {
      const description = await generateDescription.mutateAsync(titleValue);
      setValue('description', description);
      toast.success('Description generated');
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to generate';
      toast.error(message);
    }
  }

  async function onSubmit(data: TaskForm) {
    try {
      await createTask.mutateAsync({
        title: data.title,
        description: data.description || undefined,
        priority: data.priority || undefined,
        teamId: data.teamId,
        assignedTo: data.assignedTo || undefined,
        dueDate: data.dueDate ? new Date(data.dueDate).toISOString() : undefined,
      });
      toast.success('Task created');
      router.push('/tasks');
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed';
      toast.error(message);
    }
  }

  return (
    <div className="max-w-xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Create Task</h1>
      <Card>
        <CardContent className="py-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              id="title"
              label="Title"
              placeholder="Task title"
              error={errors.title?.message}
              {...register('title', { required: 'Title is required' })}
            />
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
                <button
                  type="button"
                  onClick={handleGenerateDescription}
                  disabled={generateDescription.isPending}
                  className="inline-flex items-center gap-1 text-xs text-purple-600 hover:text-purple-800 font-medium disabled:opacity-50"
                >
                  <Sparkles className="w-3 h-3" />
                  {generateDescription.isPending ? 'Generating...' : 'Generate with AI'}
                </button>
              </div>
              <textarea
                id="description"
                rows={4}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="Describe the task... or use AI to generate one"
                {...register('description')}
              />
            </div>
            <Select
              id="teamId"
              label="Team"
              error={errors.teamId?.message}
              options={[
                { value: '', label: 'Select a team...' },
                ...(teams?.map((t: { id: string; name: string }) => ({ value: t.id, label: t.name })) || []),
              ]}
              {...register('teamId', { required: 'Team is required' })}
            />
            <div className="grid grid-cols-2 gap-4">
              <Select
                id="priority"
                label="Priority"
                options={[
                  { value: '', label: 'Medium (default)' },
                  { value: 'LOW', label: 'Low' },
                  { value: 'MEDIUM', label: 'Medium' },
                  { value: 'HIGH', label: 'High' },
                ]}
                {...register('priority')}
              />
              <Input
                id="dueDate"
                type="date"
                label="Due Date"
                {...register('dueDate')}
              />
            </div>
            <div className="flex gap-3 pt-2">
              <Button type="button" variant="outline" onClick={() => router.push('/tasks')}>
                Cancel
              </Button>
              <Button type="submit" className="flex-1" disabled={createTask.isPending}>
                {createTask.isPending ? 'Creating...' : 'Create Task'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
