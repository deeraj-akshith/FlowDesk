import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function Field({ name, label, type = 'text', placeholder, value, onChange, error }) {
  return (
    <div>
      <label className="block text-sm font-medium text-zinc-700 mb-1.5">{label}</label>
      <input
        name={name}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className={`input ${error ? 'border-red-300 focus:ring-red-400' : ''}`}
      />
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  )
}

export default function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [apiError, setApiError] = useState('')

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const validate = () => {
    const errs = {}
    if (!form.name.trim()) errs.name = 'Name is required'
    if (!form.email.includes('@')) errs.email = 'Valid email required'
    if (form.password.length < 8) errs.password = 'Min 8 characters'
    if (form.password !== form.confirm) errs.confirm = 'Passwords do not match'
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
      await register(form.name, form.email, form.password)
      navigate('/dashboard')
    } catch (err) {
      setApiError(err.response?.data?.message || 'Registration failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-zinc-50 to-violet-50 p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-violet-600 mb-4">
            <svg width="22" height="22" viewBox="0 0 16 16" fill="none">
              <rect x="1" y="1" width="6" height="6" rx="1.5" fill="white" />
              <rect x="9" y="1" width="6" height="6" rx="1.5" fill="white" fillOpacity=".6" />
              <rect x="1" y="9" width="6" height="6" rx="1.5" fill="white" fillOpacity=".6" />
              <rect x="9" y="9" width="6" height="6" rx="1.5" fill="white" fillOpacity=".3" />
            </svg>
          </div>
          <h1 className="text-2xl font-semibold text-zinc-800">Create account</h1>
          <p className="text-zinc-500 text-sm mt-1">Join FlowDesk</p>
        </div>

        <div className="card p-6">
          {apiError && (
            <div className="mb-4 px-4 py-3 rounded-lg bg-red-50 border border-red-100 text-red-700 text-sm">
              {apiError}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <Field name="name" label="Full name" placeholder="Jane Smith"
              value={form.name} onChange={handleChange} error={errors.name} />
            <Field name="email" label="Email" type="email" placeholder="jane@company.com"
              value={form.email} onChange={handleChange} error={errors.email} />
            <Field name="password" label="Password" type="password" placeholder="Min 8 characters"
              value={form.password} onChange={handleChange} error={errors.password} />
            <Field name="confirm" label="Confirm password" type="password" placeholder="Repeat password"
              value={form.confirm} onChange={handleChange} error={errors.confirm} />
            <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-2.5">
              {loading ? 'Creating account…' : 'Create account'}
            </button>
          </form>
          <p className="mt-4 text-center text-sm text-zinc-500">
            Already have an account?{' '}
            <Link to="/login" className="text-violet-600 hover:text-violet-700 font-medium">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
