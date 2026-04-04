import { useEffect, useState } from 'react'
import type { Training, TrainingStatus, TrainingType } from '../../types'

export type TrainingFormValues = Omit<Training, 'training_id' | 'created_at'>

export const defaultTrainingFormValues: TrainingFormValues = {
  title: '',
  description: '',
  category: '',
  trainer_name: '',
  duration: '',
  price: 0,
  max_seats: 20,
  type: 'online',
  status: 'draft',
  thumbnail: '',
}

function stripTraining(t: Training): TrainingFormValues {
  const { training_id: _id, created_at: _ca, ...rest } = t
  return rest
}

interface TrainingFormProps {
  /** When provided, form resets when this training snapshot changes (e.g. after load). */
  initialValues: TrainingFormValues
  submitLabel: string
  onSubmit: (values: TrainingFormValues) => void
}

export function TrainingForm({
  initialValues,
  submitLabel,
  onSubmit,
}: TrainingFormProps) {
  const [form, setForm] = useState<TrainingFormValues>(() => ({
    ...initialValues,
  }))

  useEffect(() => {
    setForm({ ...initialValues })
  }, [initialValues])

  function set<K extends keyof TrainingFormValues>(
    key: K,
    v: TrainingFormValues[K],
  ) {
    setForm((f) => ({ ...f, [key]: v }))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    onSubmit(form)
  }

  return (
    <form className="form-card card" onSubmit={handleSubmit}>
      <div className="form-grid">
        <label className="field field--full">
          <span className="field-label">Training title</span>
          <input
            className="input"
            value={form.title}
            onChange={(e) => set('title', e.target.value)}
            required
          />
        </label>
        <label className="field field--full">
          <span className="field-label">Description</span>
          <textarea
            className="input textarea"
            rows={4}
            value={form.description}
            onChange={(e) => set('description', e.target.value)}
            required
          />
        </label>
        <label className="field">
          <span className="field-label">Category</span>
          <input
            className="input"
            value={form.category}
            onChange={(e) => set('category', e.target.value)}
            required
          />
        </label>
        <label className="field">
          <span className="field-label">Training type</span>
          <select
            className="input"
            value={form.type}
            onChange={(e) => set('type', e.target.value as TrainingType)}
          >
            <option value="online">Online</option>
            <option value="offline">Offline</option>
            <option value="hybrid">Hybrid</option>
          </select>
        </label>
        <label className="field">
          <span className="field-label">Trainer name</span>
          <input
            className="input"
            value={form.trainer_name}
            onChange={(e) => set('trainer_name', e.target.value)}
            required
          />
        </label>
        <label className="field">
          <span className="field-label">Duration</span>
          <input
            className="input"
            value={form.duration}
            onChange={(e) => set('duration', e.target.value)}
            placeholder="e.g. 4 weeks"
            required
          />
        </label>
        <label className="field">
          <span className="field-label">Maximum seats</span>
          <input
            className="input"
            type="number"
            min={1}
            value={form.max_seats}
            onChange={(e) => set('max_seats', Number(e.target.value))}
            required
          />
        </label>
        <label className="field">
          <span className="field-label">Price (USD)</span>
          <input
            className="input"
            type="number"
            min={0}
            step={1}
            value={form.price}
            onChange={(e) => set('price', Number(e.target.value))}
            required
          />
        </label>
        <label className="field">
          <span className="field-label">Status</span>
          <select
            className="input"
            value={form.status}
            onChange={(e) => set('status', e.target.value as TrainingStatus)}
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="closed">Closed</option>
            <option value="archived">Archived</option>
          </select>
        </label>
        <label className="field field--full">
          <span className="field-label">Thumbnail URL (optional)</span>
          <input
            className="input"
            type="url"
            value={form.thumbnail ?? ''}
            onChange={(e) => set('thumbnail', e.target.value)}
            placeholder="https://…"
          />
        </label>
      </div>
      <div className="form-actions">
        <button type="submit" className="btn btn--primary">
          {submitLabel}
        </button>
      </div>
    </form>
  )
}

export function trainingToFormValues(t: Training): TrainingFormValues {
  return stripTraining(t)
}
