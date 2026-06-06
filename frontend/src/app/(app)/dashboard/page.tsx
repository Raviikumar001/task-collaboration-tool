'use client';

import { useAuth } from '@/providers/auth-provider';
import { useTasks } from '@/hooks/use-tasks';
import { useTeams } from '@/hooks/use-teams';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckSquare, Users, Clock } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';

export default function DashboardPage() {
  const { user } = useAuth();
  const { data: tasksData } = useTasks({ assignedTo: user?.id, limit: 5 });
  const { data: teams } = useTeams();
  const { data: allTasks } = useTasks({ limit: 5 });

  const statusBadge = (status: string) => {
    const map: Record<string, 'warning' | 'info' | 'success'> = {
      OPEN: 'warning',
      IN_PROGRESS: 'info',
      COMPLETED: 'success',
    };
    return map[status] || 'default';
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        Welcome back, {user?.name}
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardContent className="flex items-center gap-4 py-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <CheckSquare className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{allTasks?.pagination?.total || 0}</p>
              <p className="text-sm text-gray-500">Total Tasks</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 py-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <Users className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{teams?.length || 0}</p>
              <p className="text-sm text-gray-500">Teams</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 py-4">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Clock className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-lg font-bold">Recent</p>
              <p className="text-sm text-gray-500">Activity</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <h2 className="font-semibold">My Tasks</h2>
          </CardHeader>
          <CardContent>
            {tasksData?.data?.length > 0 ? (
              <div className="space-y-3">
                {tasksData.data.map((task: { id: string; title: string; status: string; dueDate: string | null; team: { name: string } }) => (
                  <Link
                    key={task.id}
                    href={`/tasks/${task.id}`}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div>
                      <p className="font-medium text-gray-900">{task.title}</p>
                      <p className="text-sm text-gray-500">{task.team.name}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {task.dueDate && (
                        <span className="text-xs text-gray-400">
                          {format(new Date(task.dueDate), 'MMM d')}
                        </span>
                      )}
                      <Badge variant={statusBadge(task.status)}>{task.status}</Badge>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm py-4">No tasks assigned to you yet.</p>
            )}
            <Link href="/tasks" className="text-sm text-blue-600 hover:underline mt-3 inline-block">
              View all tasks →
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="font-semibold">My Teams</h2>
          </CardHeader>
          <CardContent>
            {teams && teams.length > 0 ? (
              <div className="space-y-3">
                {teams.map((team: { id: string; name: string; _count?: { members: number; tasks: number }; role?: string }) => (
                  <Link
                    key={team.id}
                    href={`/teams/${team.id}`}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div>
                      <p className="font-medium text-gray-900">{team.name}</p>
                      <p className="text-sm text-gray-500">
                        {team._count?.members || 0} members · {team._count?.tasks || 0} tasks
                      </p>
                    </div>
                    <Badge variant="info">{team.role}</Badge>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm py-4">No teams yet.</p>
            )}
            <Link href="/teams" className="text-sm text-blue-600 hover:underline mt-3 inline-block">
              View all teams →
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
