import { useState } from 'react'
import { Link } from 'react-router-dom'

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSent(true)
  }

  if (sent) {
    return (
      <div className="auth-form">
        <p className="auth-success">
          If an account exists for <strong>{email}</strong>, we sent reset
          instructions. Check your inbox and follow the link to set a new
          password.
        </p>
        <Link to="/login" className="btn btn--secondary btn--block">
          Back to login
        </Link>
      </div>
    )
  }

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      <p className="auth-lead">
        Enter your email and we will send a password reset link. (Demo: any
        email works.)
      </p>
      <label className="field">
        <span className="field-label">Email</span>
        <input
          className="input"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </label>
      <button type="submit" className="btn btn--primary btn--block">
        Send reset link
      </button>
      <p className="auth-footer-text">
        <Link to="/login" className="link">
          Back to login
        </Link>
      </p>
    </form>
  )
}
