import React from 'react'

const STATUS_CONFIG = {
  TODO: { label: 'To Do', className: 'badge-todo', dot: 'bg-zinc-400' },
  IN_PROGRESS: { label: 'In Progress', className: 'badge-inprogress', dot: 'bg-amber-500' },
  DONE: { label: 'Done', className: 'badge-done', dot: 'bg-teal-500' },
}

export default function StatusBadge({ status }) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.TODO
  return (
    <span className={config.className}>
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  )
}
