import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from =
    (location.state as { from?: { pathname: string } })?.from?.pathname ?? '/'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const ok = await login(email, password)
    setLoading(false)
    if (ok) navigate(from, { replace: true })
    else setError('Invalid email or password. Use a valid email address.')
  }

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      <label className="field">
        <span className="field-label">Email</span>
        <input
          className="input"
          type="email"
          autoComplete="username"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          placeholder="admin@organization.com"
        />
      </label>
      <label className="field">
        <span className="field-label">Password</span>
        <input
          className="input"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          placeholder="••••••••"
        />
      </label>
      {error ? <p className="form-error">{error}</p> : null}
      <button type="submit" className="btn btn--primary btn--block" disabled={loading}>
        {loading ? 'Signing in…' : 'Sign in'}
      </button>
      <p className="auth-footer-text">
        <Link to="/forgot-password" className="link">
          Forgot password?
        </Link>
      </p>
    </form>
  )
}
