import { useCallback, useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import {
  ChevronDown,
  ChevronUp,
  Copy,
  Mail,
  Pencil,
  Trash2,
  X,
} from 'lucide-react'
import { PageHeader } from '../../components/PageHeader'
import { useData } from '../../context/DataContext'
import { buildGoogleCalendarUrl } from '../../utils/calendar'
import type { Session, SessionMode } from '../../types'

function emptySessionForm(instructor: string) {
  return {
    title: '',
    date: '',
    start_time: '09:00',
    end_time: '10:00',
    mode: 'online' as SessionMode,
    meeting_link: '',
    location: '',
    instructor,
    notes: '',
  }
}

function sessionLocation(s: Session): string {
  if (s.mode === 'online') return s.meeting_link ?? ''
  return s.location ?? ''
}

function sessionDescription(s: Session, trainingTitle: string): string {
  return [
    `Training: ${trainingTitle}`,
    s.notes ? `Notes: ${s.notes}` : '',
    s.instructor ? `Instructor: ${s.instructor}` : '',
  ]
    .filter(Boolean)
    .join('\n')
}

export function SessionsPage() {
  const {
    trainings,
    sessions,
    addSession,
    updateSession,
    deleteSession,
    reorderSessions,
    enrollments,
    sendNotification,
  } = useData()

  const [trainingId, setTrainingId] = useState(
    () => trainings[0]?.training_id ?? '',
  )

  const training = trainings.find((t) => t.training_id === trainingId)
  const trainingSessions = useMemo(() => {
    return sessions
      .filter((s) => s.training_id === trainingId)
      .sort((a, b) => a.order - b.order || a.date.localeCompare(b.date))
  }, [sessions, trainingId])

  const [editingId, setEditingId] = useState<string | null>(null)
  const [sessionModalOpen, setSessionModalOpen] = useState(false)
  const [form, setForm] = useState(() =>
    emptySessionForm(trainings[0]?.trainer_name ?? ''),
  )

  const closeSessionModal = useCallback(() => {
    setSessionModalOpen(false)
    setEditingId(null)
    setForm(emptySessionForm(training?.trainer_name ?? ''))
  }, [training?.trainer_name])

  const openAddModal = useCallback(() => {
    setEditingId(null)
    setForm(emptySessionForm(training?.trainer_name ?? ''))
    setSessionModalOpen(true)
  }, [training?.trainer_name])

  function startEdit(s: Session) {
    setEditingId(s.session_id)
    setForm({
      title: s.title,
      date: s.date,
      start_time: s.start_time,
      end_time: s.end_time,
      mode: s.mode,
      meeting_link: s.meeting_link ?? '',
      location: s.location ?? '',
      instructor: s.instructor,
      notes: s.notes ?? '',
    })
    setSessionModalOpen(true)
  }

  useEffect(() => {
    if (!sessionModalOpen) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [sessionModalOpen])

  useEffect(() => {
    if (!sessionModalOpen) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') closeSessionModal()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [sessionModalOpen, closeSessionModal])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!trainingId || !training) return
    const order =
      editingId != null
        ? (trainingSessions.find((x) => x.session_id === editingId)?.order ??
          trainingSessions.length)
        : trainingSessions.length
    if (editingId) {
      updateSession(editingId, {
        ...form,
        meeting_link: form.mode === 'online' ? form.meeting_link : undefined,
        location: form.mode === 'offline' ? form.location : undefined,
      })
    } else {
      addSession({
        training_id: trainingId,
        title: form.title,
        date: form.date,
        start_time: form.start_time,
        end_time: form.end_time,
        mode: form.mode,
        meeting_link: form.mode === 'online' ? form.meeting_link : undefined,
        location: form.mode === 'offline' ? form.location : undefined,
        instructor: form.instructor,
        notes: form.notes || undefined,
        order,
      })
    }
    closeSessionModal()
  }

  function copyCalendarLink(s: Session) {
    if (!training) return
    const url = buildGoogleCalendarUrl({
      title: `${training.title} — ${s.title}`,
      date: s.date,
      start_time: s.start_time,
      end_time: s.end_time,
      description: sessionDescription(s, training.title),
      location: sessionLocation(s) || undefined,
    })
    void navigator.clipboard.writeText(url)
  }

  function sendCalendarInvite(s: Session) {
    if (!training) return
    const enrolled = enrollments.filter((e) => e.training_id === training.training_id)
    sendNotification({
      channel: 'email',
      event_type: 'Session reminder',
      subject: `Calendar: ${s.title} (${training.title})`,
      body: `A calendar invite link was shared for ${s.title} on ${s.date}.`,
      training_id: training.training_id,
      recipient_count: enrolled.length,
    })
    copyCalendarLink(s)
  }

  function moveSession(id: string, dir: -1 | 1) {
    const idx = trainingSessions.findIndex((x) => x.session_id === id)
    if (idx < 0) return
    const next = idx + dir
    if (next < 0 || next >= trainingSessions.length) return
    const ids = trainingSessions.map((x) => x.session_id)
    const t = ids[idx]
    ids[idx] = ids[next]!
    ids[next] = t!
    reorderSessions(trainingId, ids)
  }

  function onTrainingChange(nextId: string) {
    const tr = trainings.find((t) => t.training_id === nextId)
    setTrainingId(nextId)
    setSessionModalOpen(false)
    setEditingId(null)
    setForm(emptySessionForm(tr?.trainer_name ?? ''))
  }

  const modal =
    sessionModalOpen ? (
      <div
        className="modal-overlay"
        role="presentation"
        onClick={closeSessionModal}
      >
        <div
          className="modal modal--session"
          role="dialog"
          aria-modal="true"
          aria-labelledby="session-modal-title"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="modal-header">
            <h2 id="session-modal-title" className="modal-title">
              {editingId ? 'Edit session' : 'Add session'}
            </h2>
            <button
              type="button"
              className="modal-close"
              aria-label="Close"
              onClick={closeSessionModal}
            >
              <X size={20} strokeWidth={2} aria-hidden />
            </button>
          </div>
          <form className="modal-form" onSubmit={handleSubmit}>
            <div className="modal-body">
              <div className="session-form">
              <label className="field">
                <span className="field-label">Session title</span>
                <input
                  className="input"
                  value={form.title}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, title: e.target.value }))
                  }
                  required
                  autoFocus={!editingId}
                />
              </label>
              <label className="field">
                <span className="field-label">Date</span>
                <input
                  className="input"
                  type="date"
                  value={form.date}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, date: e.target.value }))
                  }
                  required
                />
              </label>
              <div className="form-row-2">
                <label className="field">
                  <span className="field-label">Start</span>
                  <input
                    className="input"
                    type="time"
                    value={form.start_time}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, start_time: e.target.value }))
                    }
                    required
                  />
                </label>
                <label className="field">
                  <span className="field-label">End</span>
                  <input
                    className="input"
                    type="time"
                    value={form.end_time}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, end_time: e.target.value }))
                    }
                    required
                  />
                </label>
              </div>
              <label className="field">
                <span className="field-label">Mode</span>
                <select
                  className="input"
                  value={form.mode}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      mode: e.target.value as SessionMode,
                    }))
                  }
                >
                  <option value="online">Online</option>
                  <option value="offline">Offline</option>
                </select>
              </label>
              {form.mode === 'online' ? (
                <label className="field">
                  <span className="field-label">Meeting link</span>
                  <input
                    className="input"
                    type="url"
                    value={form.meeting_link}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, meeting_link: e.target.value }))
                    }
                    placeholder="https://…"
                  />
                </label>
              ) : (
                <label className="field">
                  <span className="field-label">Location</span>
                  <input
                    className="input"
                    value={form.location}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, location: e.target.value }))
                    }
                  />
                </label>
              )}
              <label className="field">
                <span className="field-label">Instructor</span>
                <input
                  className="input"
                  value={form.instructor}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, instructor: e.target.value }))
                  }
                  required
                />
              </label>
              <label className="field">
                <span className="field-label">Notes</span>
                <textarea
                  className="input textarea"
                  rows={3}
                  value={form.notes}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, notes: e.target.value }))
                  }
                />
              </label>
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn--ghost" onClick={closeSessionModal}>
                Cancel
              </button>
              <button type="submit" className="btn btn--primary">
                {editingId ? 'Save session' : 'Add session'}
              </button>
            </div>
          </form>
        </div>
      </div>
    ) : null

  return (
    <div className="page page--full">
      <PageHeader
        title="Sessions"
        description="Schedule sessions, reorder them, and share Google Calendar links."
      />
      <div className="toolbar sessions-toolbar">
        <label className="field field--inline">
          <span className="field-label">Training</span>
          <select
            className="input"
            value={trainingId}
            onChange={(e) => onTrainingChange(e.target.value)}
          >
            {trainings.map((t) => (
              <option key={t.training_id} value={t.training_id}>
                {t.title}
              </option>
            ))}
          </select>
        </label>
        <button
          type="button"
          className="btn btn--primary"
          disabled={!training}
          onClick={openAddModal}
        >
          Add session
        </button>
      </div>

      <div className="sessions-layout">
        <section className="card card--grow sessions-timeline-card">
          <h2 className="card-title">Timeline</h2>
          {!training ? (
            <p className="muted">Select a training to view sessions.</p>
          ) : trainingSessions.length === 0 ? (
            <p className="muted">
              No sessions yet. Click <strong>Add session</strong> to create
              one.
            </p>
          ) : (
            <ol className="timeline">
              {trainingSessions.map((s) => (
                <li key={s.session_id} className="timeline-item">
                  <div className="timeline-marker" aria-hidden />
                  <div className="timeline-body">
                    <div className="timeline-head">
                      <strong>{s.title}</strong>
                      <span className="timeline-date">
                        {s.date} · {s.start_time}–{s.end_time} · {s.mode}
                      </span>
                    </div>
                    <p className="timeline-meta">
                      {s.mode === 'online' ? s.meeting_link : s.location}
                    </p>
                    {s.notes ? (
                      <p className="timeline-notes">{s.notes}</p>
                    ) : null}
                    <div className="timeline-actions">
                      <button
                        type="button"
                        className="table-icon-btn"
                        aria-label="Copy calendar link"
                        title="Copy calendar link"
                        onClick={() => copyCalendarLink(s)}
                      >
                        <Copy size={18} strokeWidth={2} aria-hidden />
                      </button>
                      <button
                        type="button"
                        className="table-icon-btn"
                        aria-label="Send calendar invite"
                        title="Send calendar invite"
                        onClick={() => sendCalendarInvite(s)}
                      >
                        <Mail size={18} strokeWidth={2} aria-hidden />
                      </button>
                      <button
                        type="button"
                        className="table-icon-btn"
                        aria-label="Edit session"
                        title="Edit"
                        onClick={() => startEdit(s)}
                      >
                        <Pencil size={18} strokeWidth={2} aria-hidden />
                      </button>
                      <button
                        type="button"
                        className="table-icon-btn"
                        aria-label="Move session up"
                        title="Move up"
                        onClick={() => moveSession(s.session_id, -1)}
                      >
                        <ChevronUp size={18} strokeWidth={2} aria-hidden />
                      </button>
                      <button
                        type="button"
                        className="table-icon-btn"
                        aria-label="Move session down"
                        title="Move down"
                        onClick={() => moveSession(s.session_id, 1)}
                      >
                        <ChevronDown size={18} strokeWidth={2} aria-hidden />
                      </button>
                      <button
                        type="button"
                        className="table-icon-btn table-icon-btn--danger"
                        aria-label="Delete session"
                        title="Delete"
                        onClick={() => {
                          if (confirm('Delete this session?'))
                            deleteSession(s.session_id)
                        }}
                      >
                        <Trash2 size={18} strokeWidth={2} aria-hidden />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          )}
        </section>
      </div>

      {sessionModalOpen
        ? createPortal(modal, document.body)
        : null}
    </div>
  )
}
