import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'

export function ResetPasswordPage() {
  const [params] = useSearchParams()
  const token = params.get('token')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (password !== confirm) {
      setError('Passwords do not match.')
      return
    }
    if (password.length < 8) {
      setError('Use at least 8 characters.')
      return
    }
    setDone(true)
  }

  if (done) {
    return (
      <div className="auth-form">
        <p className="auth-success">Your password has been updated.</p>
        <Link to="/login" className="btn btn--primary btn--block">
          Sign in
        </Link>
      </div>
    )
  }

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      <p className="auth-lead">
        Set a new password
        {token ? (
          <span className="auth-token-hint">
            {' '}
            (token: <code>{token}</code>)
          </span>
        ) : null}
      </p>
      <label className="field">
        <span className="field-label">New password</span>
        <input
          className="input"
          type="password"
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </label>
      <label className="field">
        <span className="field-label">Confirm password</span>
        <input
          className="input"
          type="password"
          autoComplete="new-password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          required
        />
      </label>
      {error ? <p className="form-error">{error}</p> : null}
      <button type="submit" className="btn btn--primary btn--block">
        Update password
      </button>
      <p className="auth-footer-text">
        <Link to="/login" className="link">
          Cancel
        </Link>
      </p>
    </form>
  )
}
