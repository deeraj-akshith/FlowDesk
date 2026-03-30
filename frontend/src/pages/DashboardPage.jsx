import React, { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { tasksApi, usersApi } from '../api'
import { useAuth } from '../context/AuthContext'
import StatusBadge from '../components/StatusBadge'

function StatCard({ label, value, color }) {
  return (
    <div className="card p-5">
      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">{label}</p>
      <p className={`text-2xl font-semibold ${color}`}>{value}</p>
    </div>
  )
}

export default function DashboardPage() {
  const { isAdmin, user } = useAuth()
  const [tasks, setTasks] = useState([])
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filters, setFilters] = useState({ status: '', assignedTo: '' })

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const params = {}
      if (filters.status) params.status = filters.status
      if (filters.assignedTo) params.assignedTo = filters.assignedTo

      const [tasksRes, usersRes] = await Promise.all([
        tasksApi.list(params),
        isAdmin ? usersApi.list() : Promise.resolve({ data: [] }),
      ])
      setTasks(tasksRes.data)
      if (isAdmin) setUsers(usersRes.data)
    } catch (err) {
      setError('Failed to load tasks. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [filters, isAdmin])

  useEffect(() => { fetchData() }, [fetchData])

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this task?')) return
    try {
      await tasksApi.delete(id)
      setTasks((prev) => prev.filter((t) => t.id !== id))
    } catch {
      alert('Could not delete task.')
    }
  }

  const counts = {
    total: tasks.length,
    todo: tasks.filter((t) => t.status === 'TODO').length,
    inProgress: tasks.filter((t) => t.status === 'IN_PROGRESS').length,
    done: tasks.filter((t) => t.status === 'DONE').length,
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-800">Dashboard</h1>
          <p className="text-sm text-zinc-500 mt-0.5">
            {isAdmin ? 'All tasks across your team' : 'Your assigned tasks'}
          </p>
        </div>
        <Link to="/tasks/new" className="btn-primary">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          New task
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="Total" value={counts.total} color="text-zinc-700" />
        <StatCard label="To Do" value={counts.todo} color="text-zinc-600" />
        <StatCard label="In Progress" value={counts.inProgress} color="text-amber-600" />
        <StatCard label="Done" value={counts.done} color="text-teal-600" />
      </div>

      {/* Filters */}
      <div className="card px-4 py-3 flex flex-wrap gap-3 items-center">
        <span className="text-sm font-medium text-slate-500">Filter:</span>
        <select
          value={filters.status}
          onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          className="input w-auto py-1.5 text-sm"
        >
          <option value="">All statuses</option>
          <option value="TODO">To Do</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="DONE">Done</option>
        </select>

        {isAdmin && (
          <select
            value={filters.assignedTo}
            onChange={(e) => setFilters({ ...filters, assignedTo: e.target.value })}
            className="input w-auto py-1.5 text-sm"
          >
            <option value="">All users</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>{u.name}</option>
            ))}
          </select>
        )}

        {(filters.status || filters.assignedTo) && (
          <button
            onClick={() => setFilters({ status: '', assignedTo: '' })}
            className="text-sm text-slate-400 hover:text-slate-600 underline"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Task list */}
      {error && (
        <div className="px-4 py-3 rounded-lg bg-red-50 border border-red-100 text-red-700 text-sm">{error}</div>
      )}

      {loading ? (
        <div className="card p-12 text-center text-slate-400">
          <div className="inline-block w-6 h-6 border-2 border-slate-200 border-t-blue-500 rounded-full animate-spin mb-3" />
          <p className="text-sm">Loading tasks…</p>
        </div>
      ) : tasks.length === 0 ? (
        <div className="card p-12 text-center">
          <p className="text-3xl mb-3">📋</p>
          <p className="font-medium text-slate-700">No tasks found</p>
          <p className="text-sm text-slate-400 mt-1">
            {filters.status || filters.assignedTo ? 'Try different filters' : 'Create your first task to get started'}
          </p>
          {!filters.status && !filters.assignedTo && (
            <Link to="/tasks/new" className="btn-primary mt-4 inline-flex">New task</Link>
          )}
        </div>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Task</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider hidden sm:table-cell">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider hidden md:table-cell">Assigned to</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider hidden lg:table-cell">Created by</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {tasks.map((task) => {
                const canEdit = isAdmin || task.assignedTo?.id === user?.id || task.createdBy?.id === user?.id
                return (
                  <tr key={task.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3">
                      <Link to={`/tasks/${task.id}`} className="font-medium text-sm text-slate-800 hover:text-blue-600 transition-colors block">
                        {task.title}
                      </Link>
                      {task.description && (
                        <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{task.description}</p>
                      )}
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <StatusBadge status={task.status} />
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell text-sm text-slate-600">
                      {task.assignedTo?.name || <span className="text-slate-300">Unassigned</span>}
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell text-sm text-slate-400">
                      {task.createdBy?.name}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {canEdit && (
                          <Link to={`/tasks/${task.id}/edit`} className="text-xs text-slate-400 hover:text-blue-600 px-2 py-1 rounded hover:bg-blue-50 transition-all">
                            Edit
                          </Link>
                        )}
                        {isAdmin && (
                          <button
                            onClick={() => handleDelete(task.id)}
                            className="text-xs text-slate-400 hover:text-red-600 px-2 py-1 rounded hover:bg-red-50 transition-all"
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
