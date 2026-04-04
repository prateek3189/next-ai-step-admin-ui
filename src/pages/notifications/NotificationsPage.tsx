import { useState } from 'react'
import { Send } from 'lucide-react'
import { PageHeader } from '../../components/PageHeader'
import { Badge } from '../../components/Badge'
import { useData } from '../../context/DataContext'

const eventTypes = [
  'New enrollment',
  'Session reminder',
  'Session update',
  'Training announcement',
] as const

export function NotificationsPage() {
  const { trainings, enrollments, notifications, sendNotification } = useData()

  const [trainingId, setTrainingId] = useState(trainings[0]?.training_id ?? '')
  const [channel, setChannel] = useState<'email' | 'in_app'>('email')
  const [eventType, setEventType] = useState<string>(eventTypes[3])
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const t = trainings.find((x) => x.training_id === trainingId)
    const count = enrollments.filter((e) => e.training_id === trainingId).length
    sendNotification({
      channel,
      event_type: eventType,
      subject: subject || `${eventType} — ${t?.title ?? 'Training'}`,
      body,
      training_id: trainingId || null,
      recipient_count: count,
    })
    setSubject('')
    setBody('')
  }

  return (
    <div className="page">
      <PageHeader
        title="Notifications"
        description="Email and in-app messages to enrolled students (demo log)."
      />
      <div className="notifications-layout">
        <form className="card form-card" onSubmit={handleSubmit}>
          <h2 className="card-title">Compose</h2>
          <label className="field">
            <span className="field-label">Training audience</span>
            <select
              className="input"
              value={trainingId}
              onChange={(e) => setTrainingId(e.target.value)}
            >
              {trainings.map((t) => (
                <option key={t.training_id} value={t.training_id}>
                  {t.title}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            <span className="field-label">Channel</span>
            <select
              className="input"
              value={channel}
              onChange={(e) =>
                setChannel(e.target.value as 'email' | 'in_app')
              }
            >
              <option value="email">Email</option>
              <option value="in_app">In-app</option>
            </select>
          </label>
          <label className="field">
            <span className="field-label">Event type</span>
            <select
              className="input"
              value={eventType}
              onChange={(e) => setEventType(e.target.value)}
            >
              {eventTypes.map((et) => (
                <option key={et} value={et}>
                  {et}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            <span className="field-label">Subject</span>
            <input
              className="input"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Optional — defaults from event type"
            />
          </label>
          <label className="field">
            <span className="field-label">Message</span>
            <textarea
              className="input textarea"
              rows={5}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              required
              placeholder="Message body sent to enrolled students…"
            />
          </label>
          <button type="submit" className="btn btn--primary">
            <Send size={18} strokeWidth={2} aria-hidden />
            Send notification
          </button>
        </form>

        <section className="card card--grow">
          <h2 className="card-title">Recent activity</h2>
          <ul className="notification-log">
            {notifications.map((n) => (
              <li key={n.notification_id} className="notification-log-item">
                <div className="notification-log-head">
                  <strong>{n.subject}</strong>
                  <Badge variant="muted">{n.channel}</Badge>
                </div>
                <p className="notification-log-meta">
                  {n.event_type} ·{' '}
                  {new Date(n.sent_at).toLocaleString()} · {n.recipient_count}{' '}
                  recipients
                </p>
                <p className="notification-log-body">{n.body}</p>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  )
}
