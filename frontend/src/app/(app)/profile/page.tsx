'use client';

import { useState } from 'react';
import { useAuth } from '@/providers/auth-provider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { useForm } from 'react-hook-form';
import api from '@/lib/api';
import { toast } from 'sonner';

interface ProfileForm {
  name: string;
  email: string;
  currentPassword: string;
  password: string;
}

export default function ProfilePage() {
  const { user, setUser } = useAuth();
  const [saving, setSaving] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<ProfileForm>({
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
    },
  });

  async function onSubmit(data: ProfileForm) {
    setSaving(true);
    try {
      const payload: Record<string, string> = {};
      if (data.name !== user?.name) payload.name = data.name;
      if (data.email !== user?.email) payload.email = data.email;
      if (data.password) {
        payload.password = data.password;
        payload.currentPassword = data.currentPassword;
      }
      if (Object.keys(payload).length === 0) {
        toast.info('No changes to save');
        setSaving(false);
        return;
      }
      await api.put(`/users/${user?.id}`, payload);
      if (user) {
        setUser({ ...user, name: data.name, email: data.email });
      }
      toast.success('Profile updated');
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed';
      toast.error(message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-lg mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Profile</h1>

      <Card>
        <CardHeader><h2 className="font-semibold">Your Information</h2></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              id="name"
              label="Name"
              {...register('name', { required: 'Name is required' })}
              error={errors.name?.message}
            />
            <Input
              id="email"
              type="email"
              label="Email"
              {...register('email', { required: 'Email is required' })}
              error={errors.email?.message}
            />
            <hr className="border-gray-100" />
            <p className="text-sm font-medium text-gray-700">Change Password</p>
            <Input
              id="currentPassword"
              type="password"
              label="Current Password"
              placeholder="Enter current password"
              {...register('currentPassword')}
              error={errors.currentPassword?.message}
            />
            <Input
              id="password"
              type="password"
              label="New Password"
              placeholder="8+ chars, uppercase, lowercase, digit, special"
              {...register('password')}
              error={errors.password?.message}
            />
            <Button type="submit" disabled={saving} className="w-full">
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="mt-4">
        <CardHeader><h2 className="font-semibold">Account Info</h2></CardHeader>
        <CardContent>
          <div className="text-sm text-gray-500 space-y-1">
            <p>User ID: {user?.id}</p>
            <p>Joined: {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : '-'}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
