const statusMap: Record<string, 'warning' | 'info' | 'success'> = {
  OPEN: 'warning',
  IN_PROGRESS: 'info',
  COMPLETED: 'success',
};

const priorityMap: Record<string, 'danger' | 'warning' | 'default'> = {
  HIGH: 'danger',
  MEDIUM: 'warning',
  LOW: 'default',
};

export function statusBadge(status: string) {
  return statusMap[status] || 'default';
}

export function priorityBadge(priority: string) {
  return priorityMap[priority] || 'default';
}
