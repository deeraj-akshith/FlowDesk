import React, { useState, useEffect } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { tasksApi } from '../api'
import { useAuth } from '../context/AuthContext'
import StatusBadge from '../components/StatusBadge'

export default function TaskDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { isAdmin, user } = useAuth()
  const [task, setTask] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    tasksApi.getById(id)
      .then(({ data }) => setTask(data))
      .catch(() => setError('Task not found.'))
      .finally(() => setLoading(false))
  }, [id])

  const handleDelete = async () => {
    if (!window.confirm('Delete this task?')) return
    try {
      await tasksApi.delete(id)
      navigate('/dashboard')
    } catch {
      alert('Could not delete task.')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 border-2 border-slate-200 border-t-blue-500 rounded-full animate-spin" />
      </div>
    )
  }

  if (error || !task) {
    return (
      <div className="card p-12 text-center">
        <p className="text-3xl mb-3">🔍</p>
        <p className="font-medium text-slate-700">{error || 'Task not found'}</p>
        <Link to="/dashboard" className="btn-secondary mt-4 inline-flex">Back to dashboard</Link>
      </div>
    )
  }

  const canEdit = isAdmin || task.assignedTo?.id === user?.id || task.createdBy?.id === user?.id
  const fmt = (dateStr) => dateStr ? new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—'

  return (
    <div className="max-w-2xl">
      {/* Header */}
      <div className="flex items-start gap-3 mb-6">
        <Link to="/dashboard" className="mt-1 text-slate-400 hover:text-slate-600 transition-colors shrink-0">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M12 4l-6 6 6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-xl font-semibold text-slate-800">{task.title}</h1>
            <StatusBadge status={task.status} />
          </div>
          <p className="text-sm text-slate-400 mt-1">Task #{task.id}</p>
        </div>
      </div>

      <div className="space-y-4">
        {/* Description */}
        <div className="card p-5">
          <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Description</h2>
          {task.description
            ? <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{task.description}</p>
            : <p className="text-sm text-slate-400 italic">No description provided.</p>
          }
        </div>

        {/* Meta */}
        <div className="card p-5">
          <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Details</h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-slate-400 mb-0.5">Assigned to</p>
              <p className="font-medium text-slate-700">{task.assignedTo?.name || '—'}</p>
            </div>
            <div>
              <p className="text-slate-400 mb-0.5">Created by</p>
              <p className="font-medium text-slate-700">{task.createdBy?.name || '—'}</p>
            </div>
            <div>
              <p className="text-slate-400 mb-0.5">Created</p>
              <p className="font-medium text-slate-700">{fmt(task.createdAt)}</p>
            </div>
            <div>
              <p className="text-slate-400 mb-0.5">Last updated</p>
              <p className="font-medium text-slate-700">{fmt(task.updatedAt)}</p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          {canEdit && <Link to={`/tasks/${task.id}/edit`} className="btn-primary">Edit task</Link>}
          {isAdmin && <button onClick={handleDelete} className="btn-danger">Delete</button>}
          <Link to="/dashboard" className="btn-secondary">Back</Link>
        </div>
      </div>
    </div>
  )
}
