import React, { useState, useEffect } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { tasksApi, usersApi } from '../api'
import { useAuth } from '../context/AuthContext'

export default function TaskFormPage() {
  const { id } = useParams()
  const isEdit = Boolean(id)
  const navigate = useNavigate()
  const { isAdmin, user } = useAuth()

  const [form, setForm] = useState({ title: '', description: '', status: 'TODO', assignedTo: '' })
  const [users, setUsers] = useState([])
  const [errors, setErrors] = useState({})
  const [apiError, setApiError] = useState('')
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(isEdit)

  useEffect(() => {
    usersApi.list().then((res) => setUsers(res.data)).catch(() => {})
    if (isEdit) {
      tasksApi.getById(id)
        .then(({ data }) => {
          setForm({
            title: data.title,
            description: data.description || '',
            status: data.status,
            assignedTo: data.assignedTo?.id?.toString() || '',
          })
        })
        .catch(() => setApiError('Could not load task.'))
        .finally(() => setFetching(false))
    }
  }, [id, isEdit])

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const validate = () => {
    const errs = {}
    if (!form.title.trim()) errs.title = 'Title is required'
    return errs
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setApiError('')
    const errs = validate()
    setErrors(errs)
    if (Object.keys(errs).length) return
    setLoading(true)
    try {
      const payload = {
        title: form.title.trim(),
        description: form.description.trim() || null,
        status: form.status,
        assignedToId: form.assignedTo ? parseInt(form.assignedTo) : null,
      }
      if (isEdit) {
        await tasksApi.update(id, payload)
      } else {
        await tasksApi.create(payload)
      }
      navigate('/dashboard')
    } catch (err) {
      const data = err.response?.data
      if (data?.errors) {
        setErrors(data.errors)
      } else {
        setApiError(data?.message || 'Something went wrong.')
      }
    } finally {
      setLoading(false)
    }
  }

  if (fetching) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 border-2 border-slate-200 border-t-blue-500 rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-xl">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link to="/dashboard" className="text-slate-400 hover:text-slate-600 transition-colors">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M12 4l-6 6 6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </Link>
        <div>
          <h1 className="text-xl font-semibold text-slate-800">{isEdit ? 'Edit task' : 'New task'}</h1>
          <p className="text-sm text-slate-500 mt-0.5">{isEdit ? 'Update task details' : 'Fill in the details below'}</p>
        </div>
      </div>

      <div className="card p-6">
        {apiError && (
          <div className="mb-4 px-4 py-3 rounded-lg bg-red-50 border border-red-100 text-red-700 text-sm">{apiError}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Title <span className="text-red-500">*</span></label>
            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="e.g. Design the onboarding flow"
              className={`input ${errors.title ? 'border-red-300 focus:ring-red-400' : ''}`}
            />
            {errors.title && <p className="mt-1 text-xs text-red-600">{errors.title}</p>}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Description</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={4}
              placeholder="Optional — add more context…"
              className="input resize-none"
            />
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Status</label>
            <select name="status" value={form.status} onChange={handleChange} className="input">
              <option value="TODO">To Do</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="DONE">Done</option>
            </select>
          </div>

          {/* Assign to (admin can assign to anyone; users see the list too for self-assign) */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Assign to</label>
            <select name="assignedTo" value={form.assignedTo} onChange={handleChange} className="input">
              <option value="">Unassigned</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>{u.name}{u.id === user?.id ? ' (me)' : ''}</option>
              ))}
            </select>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? 'Saving…' : isEdit ? 'Save changes' : 'Create task'}
            </button>
            <Link to="/dashboard" className="btn-secondary">Cancel</Link>
          </div>
        </form>
      </div>
    </div>
  )
}
