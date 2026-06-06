'use client';

import { useState } from 'react';
import { useTasks } from '@/hooks/use-tasks';
import { useTeams } from '@/hooks/use-teams';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Search } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';

const statusBadge = (status: string) => {
  const map: Record<string, 'warning' | 'info' | 'success'> = {
    OPEN: 'warning',
    IN_PROGRESS: 'info',
    COMPLETED: 'success',
  };
  return map[status] || 'default';
};

const priorityBadge = (priority: string) => {
  const map: Record<string, 'danger' | 'warning' | 'default'> = {
    HIGH: 'danger',
    MEDIUM: 'warning',
    LOW: 'default',
  };
  return map[priority] || 'default';
};

export default function TasksPage() {
  const [status, setStatus] = useState('');
  const [priority, setPriority] = useState('');
  const [teamId, setTeamId] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const { data: teams } = useTeams();
  const { data: tasksData, isLoading } = useTasks({ status, priority, teamId, search, page, limit: 10 });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Tasks</h1>
        <Link href="/tasks/new">
          <Button>
            <Plus className="w-4 h-4 mr-2" /> New Task
          </Button>
        </Link>
      </div>

      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search tasks..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-10 pr-3 py-2 rounded-lg border border-gray-300 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
        <Select
          value={status}
          onChange={(e) => { setStatus(e.target.value); setPage(1); }}
          options={[
            { value: '', label: 'All Status' },
            { value: 'OPEN', label: 'Open' },
            { value: 'IN_PROGRESS', label: 'In Progress' },
            { value: 'COMPLETED', label: 'Completed' },
          ]}
        />
        <Select
          value={priority}
          onChange={(e) => { setPriority(e.target.value); setPage(1); }}
          options={[
            { value: '', label: 'All Priority' },
            { value: 'HIGH', label: 'High' },
            { value: 'MEDIUM', label: 'Medium' },
            { value: 'LOW', label: 'Low' },
          ]}
        />
        <Select
          value={teamId}
          onChange={(e) => { setTeamId(e.target.value); setPage(1); }}
          options={[
            { value: '', label: 'All Teams' },
            ...(teams?.map((t: { id: string; name: string }) => ({ value: t.id, label: t.name })) || []),
          ]}
        />
      </div>

      {isLoading ? (
        <p className="text-gray-500">Loading...</p>
      ) : tasksData?.data?.length > 0 ? (
        <>
          <div className="space-y-3">
            {tasksData.data.map((task: { id: string; title: string; status: string; priority: string; dueDate: string | null; assignee: { name: string } | null; team: { name: string }; _count?: { comments: number; attachments: number } }) => (
              <Link key={task.id} href={`/tasks/${task.id}`}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="flex items-center justify-between py-4">
                    <div>
                      <p className="font-medium text-gray-900">{task.title}</p>
                      <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                        <span>{task.team.name}</span>
                        {task.assignee && <span>· Assigned to {task.assignee.name}</span>}
                        {task.dueDate && (
                          <span>· Due {format(new Date(task.dueDate), 'MMM d, yyyy')}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={priorityBadge(task.priority)}>{task.priority}</Badge>
                      <Badge variant={statusBadge(task.status)}>{task.status}</Badge>
                      {task._count && (
                        <span className="text-xs text-gray-400">
                          {task._count.comments > 0 && `💬${task._count.comments}`}
                          {task._count.attachments > 0 && ` 📎${task._count.attachments}`}
                        </span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>

          {tasksData.pagination && (
            <div className="flex items-center justify-between mt-6">
              <p className="text-sm text-gray-500">
                Page {tasksData.pagination.page} of {tasksData.pagination.totalPages} ({tasksData.pagination.total} tasks)
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage(page - 1)}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= tasksData.pagination.totalPages}
                  onClick={() => setPage(page + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-500 mb-4">No tasks found</p>
            <Link href="/tasks/new">
              <Button><Plus className="w-4 h-4 mr-2" /> Create Task</Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
