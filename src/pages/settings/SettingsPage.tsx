import { Save } from 'lucide-react'
import { PageHeader } from '../../components/PageHeader'

export function SettingsPage() {
  return (
    <div className="page">
      <PageHeader
        title="Settings"
        description="Portal preferences and integration placeholders."
      />
      <div className="settings-grid">
        <section className="card">
          <h2 className="card-title">Organization</h2>
          <label className="field">
            <span className="field-label">Organization name</span>
            <input className="input" defaultValue="Acme Learning" />
          </label>
          <label className="field">
            <span className="field-label">Support email</span>
            <input
              className="input"
              type="email"
              defaultValue="support@example.com"
            />
          </label>
        </section>
        <section className="card">
          <h2 className="card-title">Authentication</h2>
          <p className="muted">
            This demo uses client-side session storage. Production should use JWT
            or server sessions against your REST API.
          </p>
        </section>
        <section className="card">
          <h2 className="card-title">Payments (future)</h2>
          <p className="muted">
            Razorpay / Stripe keys and webhook endpoints will be configured here.
          </p>
        </section>
      </div>
      <div className="settings-footer">
        <button type="button" className="btn btn--primary">
          <Save size={18} strokeWidth={2} aria-hidden />
          Save changes
        </button>
      </div>
    </div>
  )
}
