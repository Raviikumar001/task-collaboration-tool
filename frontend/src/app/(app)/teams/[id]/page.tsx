'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { useTeam, useAddMember, useRemoveMember, useUpdateMemberRole } from '@/hooks/use-teams';
import { useAuth } from '@/providers/auth-provider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { UserPlus, Trash2, ChevronUp, ChevronDown } from 'lucide-react';

export default function TeamDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { data: team, isLoading } = useTeam(id);
  const addMember = useAddMember();
  const removeMember = useRemoveMember();
  const updateRole = useUpdateMemberRole();
  const [modalOpen, setModalOpen] = useState(false);
  const { register, handleSubmit, reset, formState: { errors } } = useForm<{ email: string }>();

  async function onAddMember(data: { email: string }) {
    try {
      await addMember.mutateAsync({ teamId: id, email: data.email });
      toast.success('Member added');
      setModalOpen(false);
      reset();
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed';
      toast.error(message);
    }
  }

  async function onRemoveMember(userId: string) {
    try {
      await removeMember.mutateAsync({ teamId: id, userId });
      toast.success('Member removed');
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed';
      toast.error(message);
    }
  }

  async function onPromote(userId: string) {
    try {
      await updateRole.mutateAsync({ teamId: id, userId, role: 'ADMIN' });
      toast.success('Role updated');
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed';
      toast.error(message);
    }
  }

  async function onDemote(userId: string) {
    try {
      await updateRole.mutateAsync({ teamId: id, userId, role: 'MEMBER' });
      toast.success('Role updated');
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed';
      toast.error(message);
    }
  }

  if (isLoading) return <p className="text-gray-500">Loading...</p>;
  if (!team) return <p className="text-gray-500">Team not found</p>;

  const isOwnerOrAdmin = team.members?.some(
    (m: { userId: string; role: string }) => m.userId === user?.id && (m.role === 'OWNER' || m.role === 'ADMIN'),
  );

  const isOwner = team.members?.some(
    (m: { userId: string; role: string }) => m.userId === user?.id && m.role === 'OWNER',
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{team.name}</h1>
          {team.description && <p className="text-gray-500 mt-1">{team.description}</p>}
        </div>
        {isOwnerOrAdmin && (
          <Button onClick={() => setModalOpen(true)}>
            <UserPlus className="w-4 h-4 mr-2" /> Add Member
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <h2 className="font-semibold">
            Members ({team.members?.length || 0})
          </h2>
        </CardHeader>
        <CardContent>
          <div className="divide-y divide-gray-100">
            {team.members?.map((member: { id: string; userId: string; role: string; user: { id: string; name: string; email: string } }) => (
              <div key={member.id} className="flex items-center justify-between py-3">
                <div>
                  <p className="font-medium text-gray-900">{member.user.name}</p>
                  <p className="text-sm text-gray-500">{member.user.email}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    variant={member.role === 'OWNER' ? 'danger' : member.role === 'ADMIN' ? 'info' : 'default'}
                  >
                    {member.role}
                  </Badge>
                  {isOwner && member.role !== 'OWNER' && (
                    <>
                      {member.role === 'MEMBER' ? (
                        <button
                          onClick={() => onPromote(member.userId)}
                          className="p-1 text-gray-400 hover:text-blue-600"
                          title="Promote to Admin"
                        >
                          <ChevronUp className="w-4 h-4" />
                        </button>
                      ) : (
                        <button
                          onClick={() => onDemote(member.userId)}
                          className="p-1 text-gray-400 hover:text-yellow-600"
                          title="Demote to Member"
                        >
                          <ChevronDown className="w-4 h-4" />
                        </button>
                      )}
                    </>
                  )}
                  {isOwnerOrAdmin && member.role !== 'OWNER' && member.userId !== user?.id && (
                    <button
                      onClick={() => onRemoveMember(member.userId)}
                      className="p-1 text-gray-400 hover:text-red-600"
                      title="Remove member"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
            {(!team.members || team.members.length === 0) && (
              <p className="text-gray-500 py-4">No members</p>
            )}
          </div>
        </CardContent>
      </Card>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Add Member">
        <form onSubmit={handleSubmit(onAddMember)} className="space-y-4">
          <Input
            id="email"
            type="email"
            label="User Email"
            placeholder="Enter email address"
            error={errors.email?.message}
            {...register('email', { required: 'Email is required' })}
          />
          <Button type="submit" className="w-full" disabled={addMember.isPending}>
            {addMember.isPending ? 'Adding...' : 'Add Member'}
          </Button>
        </form>
      </Modal>
    </div>
  );
}
