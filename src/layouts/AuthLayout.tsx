import { GraduationCap } from 'lucide-react'
import { Outlet } from 'react-router-dom'

export function AuthLayout() {
  return (
    <div className="auth-shell">
      <div className="auth-panel">
        <div className="auth-brand">
          <span className="admin-brand-mark admin-brand-mark--lg" aria-hidden>
            <GraduationCap size={26} strokeWidth={1.75} />
          </span>
          <div className="auth-brand-text">
            <div className="auth-brand-title-row">
              <h1 className="auth-title">Training Management</h1>
              <span className="auth-brand-badge">Portal</span>
            </div>
            <p className="auth-subtitle">Administrator portal</p>
          </div>
        </div>
        <Outlet />
      </div>
    </div>
  )
}
