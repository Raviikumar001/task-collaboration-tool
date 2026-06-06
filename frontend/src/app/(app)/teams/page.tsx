'use client';

import { useState } from 'react';
import { useTeams, useCreateTeam } from '@/hooks/use-teams';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Modal } from '@/components/ui/modal';
import { Badge } from '@/components/ui/badge';
import { Plus, Users } from 'lucide-react';
import { useForm } from 'react-hook-form';
import Link from 'next/link';
import { toast } from 'sonner';

export default function TeamsPage() {
  const { data: teams, isLoading } = useTeams();
  const createTeam = useCreateTeam();
  const [modalOpen, setModalOpen] = useState(false);
  const { register, handleSubmit, reset, formState: { errors } } = useForm<{ name: string; description: string }>();

  async function onSubmit(data: { name: string; description: string }) {
    try {
      await createTeam.mutateAsync(data);
      toast.success('Team created');
      setModalOpen(false);
      reset();
    } catch {
      toast.error('Failed to create team');
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Teams</h1>
        <Button onClick={() => setModalOpen(true)}>
          <Plus className="w-4 h-4 mr-2" /> New Team
        </Button>
      </div>

      {isLoading ? (
        <p className="text-gray-500">Loading...</p>
      ) : teams && teams.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {teams.map((team: { id: string; name: string; description: string | null; _count?: { members: number; tasks: number }; role?: string }) => (
            <Link key={team.id} href={`/teams/${team.id}`}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900">{team.name}</h3>
                    <Badge variant="info">{team.role}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-500 line-clamp-2 mb-3">
                    {team.description || 'No description'}
                  </p>
                  <div className="flex items-center gap-4 text-sm text-gray-400">
                    <span className="flex items-center gap-1">
                      <Users className="w-4 h-4" /> {team._count?.members || 0}
                    </span>
                    <span>{team._count?.tasks || 0} tasks</span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-500 mb-4">No teams yet. Create your first team!</p>
            <Button onClick={() => setModalOpen(true)}>
              <Plus className="w-4 h-4 mr-2" /> Create Team
            </Button>
          </CardContent>
        </Card>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Create Team">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            id="name"
            label="Team Name"
            placeholder="Enter team name"
            error={errors.name?.message}
            {...register('name', { required: 'Team name is required' })}
          />
          <div className="space-y-1">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              id="description"
              rows={3}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="Optional description"
              {...register('description')}
            />
          </div>
          <Button type="submit" className="w-full" disabled={createTeam.isPending}>
            {createTeam.isPending ? 'Creating...' : 'Create Team'}
          </Button>
        </form>
      </Modal>
    </div>
  );
}
