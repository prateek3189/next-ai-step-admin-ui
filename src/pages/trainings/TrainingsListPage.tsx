import { Archive, Lock, Pencil, Send, Trash2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Badge } from '../../components/Badge'
import { PageHeader } from '../../components/PageHeader'
import { useData } from '../../context/DataContext'
import type { TrainingStatus, TrainingType } from '../../types'

function statusVariant(
  s: TrainingStatus,
): 'default' | 'success' | 'warning' | 'muted' {
  if (s === 'published') return 'success'
  if (s === 'draft') return 'warning'
  if (s === 'closed' || s === 'archived') return 'muted'
  return 'default'
}

function typeLabel(t: TrainingType): string {
  const m: Record<TrainingType, string> = {
    online: 'Online',
    offline: 'Offline',
    hybrid: 'Hybrid',
  }
  return m[t]
}

export function TrainingsListPage() {
  const {
    trainings,
    deleteTraining,
    setTrainingStatus,
  } = useData()

  return (
    <div className="page">
      <PageHeader
        title="Trainings"
        description="Create and manage training programs."
        actions={
          <Link to="/trainings/new" className="btn btn--primary">
            Create training
          </Link>
        }
      />
      <div className="table-wrap card card--flush">
        <table className="data-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Category</th>
              <th>Type</th>
              <th>Trainer</th>
              <th>Price</th>
              <th>Seats</th>
              <th>Status</th>
              <th aria-label="Actions" />
            </tr>
          </thead>
          <tbody>
            {trainings.map((t) => (
              <tr key={t.training_id}>
                <td>
                  <Link to={`/trainings/${t.training_id}/edit`} className="table-link">
                    {t.title}
                  </Link>
                </td>
                <td>{t.category}</td>
                <td>{typeLabel(t.type)}</td>
                <td>{t.trainer_name}</td>
                <td>${t.price}</td>
                <td>{t.max_seats}</td>
                <td>
                  <Badge variant={statusVariant(t.status)}>
                    {t.status}
                  </Badge>
                </td>
                <td className="table-actions">
                  <div className="btn-group">
                    <Link
                      to={`/trainings/${t.training_id}/edit`}
                      className="table-icon-btn"
                      aria-label={`Edit “${t.title}”`}
                      title="Edit"
                    >
                      <Pencil size={18} strokeWidth={2} aria-hidden />
                    </Link>
                    {t.status === 'draft' && (
                      <button
                        type="button"
                        className="table-icon-btn"
                        aria-label="Publish training"
                        title="Publish"
                        onClick={() =>
                          setTrainingStatus(t.training_id, 'published')
                        }
                      >
                        <Send size={18} strokeWidth={2} aria-hidden />
                      </button>
                    )}
                    {t.status === 'published' && (
                      <button
                        type="button"
                        className="table-icon-btn"
                        aria-label="Close training"
                        title="Close"
                        onClick={() =>
                          setTrainingStatus(t.training_id, 'closed')
                        }
                      >
                        <Lock size={18} strokeWidth={2} aria-hidden />
                      </button>
                    )}
                    {(t.status === 'closed' || t.status === 'published') && (
                      <button
                        type="button"
                        className="table-icon-btn"
                        aria-label="Archive training"
                        title="Archive"
                        onClick={() =>
                          setTrainingStatus(t.training_id, 'archived')
                        }
                      >
                        <Archive size={18} strokeWidth={2} aria-hidden />
                      </button>
                    )}
                    <button
                      type="button"
                      className="table-icon-btn table-icon-btn--danger"
                      aria-label="Delete training"
                      title="Delete"
                      onClick={() => {
                        if (
                          confirm(
                            `Delete “${t.title}”? Sessions and related records in this demo are removed.`,
                          )
                        )
                          deleteTraining(t.training_id)
                      }}
                    >
                      <Trash2 size={18} strokeWidth={2} aria-hidden />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
