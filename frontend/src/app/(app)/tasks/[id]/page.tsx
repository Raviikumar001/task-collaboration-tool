'use client';

import { useState, useRef } from 'react';
import { useParams } from 'next/navigation';
import { useTask, useUpdateTask, useDeleteTask, useAssignTask, useUpdateTaskStatus } from '@/hooks/use-tasks';
import { useComments, useAddComment, useDeleteComment, useAttachments, useUploadAttachment, useDeleteAttachment } from '@/hooks/use-comments';
import { useTeams } from '@/hooks/use-teams';
import { useAuth } from '@/providers/auth-provider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { Trash2, Paperclip, Send, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

import { statusBadge, priorityBadge } from '@/lib/constants';

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function TaskDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const { user } = useAuth();
  const { data: task, isLoading: taskLoading } = useTask(id);
  const { data: comments } = useComments(id);
  const { data: attachments } = useAttachments(id);
  const { data: teams } = useTeams();
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();
  const assignTask = useAssignTask();
  const updateStatus = useUpdateTaskStatus();
  const addComment = useAddComment();
  const deleteComment = useDeleteComment();
  const uploadAttachment = useUploadAttachment();
  const deleteAttachment = useDeleteAttachment();

  const [commentText, setCommentText] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleStatusChange(status: string) {
    try {
      await updateStatus.mutateAsync({ id, status });
      toast.success('Status updated');
    } catch { toast.error('Failed'); }
  }

  async function handleAssign(userId: string) {
    try {
      await assignTask.mutateAsync({ id, userId });
      toast.success('Task assigned');
    } catch { toast.error('Failed'); }
  }

  async function handleDelete() {
    if (!confirm('Delete this task?')) return;
    try {
      await deleteTask.mutateAsync(id);
      toast.success('Task deleted');
      window.location.href = '/tasks';
    } catch { toast.error('Failed'); }
  }

  async function handleAddComment() {
    if (!commentText.trim()) return;
    try {
      await addComment.mutateAsync({ taskId: id, content: commentText });
      setCommentText('');
      toast.success('Comment added');
    } catch { toast.error('Failed'); }
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      await uploadAttachment.mutateAsync({ taskId: id, file });
      toast.success('File uploaded');
    } catch { toast.error('Upload failed'); }
  }

  if (taskLoading) return <p className="text-gray-500">Loading...</p>;
  if (!task) return <p className="text-gray-500">Task not found</p>;

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link href="/tasks" className="text-gray-400 hover:text-gray-600">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">{task.title}</h1>
          <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
            <span>{task.team.name}</span>
            <span>· Created by {task.creator.name}</span>
            <span>· {format(new Date(task.createdAt), 'MMM d, yyyy')}</span>
          </div>
        </div>
        <Button variant="destructive" size="sm" onClick={handleDelete} disabled={deleteTask.isPending}>
          <Trash2 className="w-4 h-4 mr-1" /> {deleteTask.isPending ? 'Deleting...' : 'Delete'}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {task.description && (
            <Card>
              <CardHeader><h2 className="font-semibold">Description</h2></CardHeader>
              <CardContent><p className="text-gray-700 whitespace-pre-wrap">{task.description}</p></CardContent>
            </Card>
          )}

          <Card>
            <CardHeader><h2 className="font-semibold">Comments</h2></CardHeader>
            <CardContent>
              <div className="flex gap-2 mb-4">
                <input
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Write a comment..."
                  className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  onKeyDown={(e) => e.key === 'Enter' && handleAddComment()}
                />
                <Button size="sm" onClick={handleAddComment} disabled={addComment.isPending}>
                  <Send className="w-4 h-4" />
                </Button>
              </div>
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {comments?.map((c: { id: string; content: string; user: { name: string }; createdAt: string; userId: string }) => (
                  <div key={c.id} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-medium">{c.user.name}</p>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-400">{format(new Date(c.createdAt), 'MMM d, h:mm a')}</span>
                        {c.userId === user?.id && (
                          <button
                            onClick={() => deleteComment.mutate({ taskId: id, commentId: c.id })}
                            disabled={deleteComment.isPending}
                            className="text-gray-400 hover:text-red-600 text-xs disabled:opacity-50"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-gray-700">{c.content}</p>
                  </div>
                ))}
                {(!comments || comments.length === 0) && <p className="text-gray-400 text-sm py-4">No comments yet</p>}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <h2 className="font-semibold">Attachments</h2>
                <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                  <Paperclip className="w-4 h-4 mr-1" /> Upload
                </Button>
                <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileUpload} />
              </div>
            </CardHeader>
            <CardContent>
              {attachments && attachments.length > 0 ? (
                <div className="space-y-2">
                  {attachments.map((a: { id: string; filename: string; url: string; mimeType: string; size: number; uploadedBy: string; uploader: { name: string } }) => (
                    <div key={a.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                      <div>
                        <a
                          href={`http://localhost:3000${a.url}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:underline"
                        >
                          {a.filename}
                        </a>
                        <p className="text-xs text-gray-400">
                          {formatFileSize(a.size)} · {a.uploader.name}
                        </p>
                      </div>
                      {a.uploadedBy === user?.id && (
                        <button
                          onClick={() => deleteAttachment.mutate({ taskId: id, attachmentId: a.id })}
                          disabled={deleteAttachment.isPending}
                          className="text-gray-400 hover:text-red-600 disabled:opacity-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400 text-sm py-2">No attachments</p>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader><h2 className="font-semibold">Details</h2></CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Status</p>
                <Select
                  value={task.status}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  options={[
                    { value: 'OPEN', label: 'Open' },
                    { value: 'IN_PROGRESS', label: 'In Progress' },
                    { value: 'COMPLETED', label: 'Completed' },
                  ]}
                />
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Priority</p>
                <Badge variant={priorityBadge(task.priority)}>{task.priority}</Badge>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Assignee</p>
                {task.assignee ? (
                  <p className="font-medium">{task.assignee.name}</p>
                ) : (
                  <p className="text-gray-400 text-sm">Unassigned</p>
                )}
              </div>
              {task.dueDate && (
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Due Date</p>
                  <p className="font-medium">{format(new Date(task.dueDate), 'MMM d, yyyy')}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
