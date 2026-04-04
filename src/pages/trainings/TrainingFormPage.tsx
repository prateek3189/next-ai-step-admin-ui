import { useMemo } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { PageHeader } from '../../components/PageHeader'
import { useData } from '../../context/DataContext'
import {
  defaultTrainingFormValues,
  TrainingForm,
  trainingToFormValues,
} from './TrainingForm'

export function TrainingFormPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { trainings, updateTraining } = useData()

  const existing = useMemo(
    () => trainings.find((t) => t.training_id === id),
    [trainings, id],
  )

  const initialValues = useMemo(
    () => (existing ? trainingToFormValues(existing) : defaultTrainingFormValues),
    [existing],
  )

  if (!id || !existing) {
    return (
      <div className="page">
        <PageHeader title="Training not found" />
        <Link to="/trainings" className="link">
          Back to trainings
        </Link>
      </div>
    )
  }

  return (
    <div className="page page--full">
      <PageHeader
        title="Edit training"
        description="Update program details, capacity, and pricing."
        actions={
          <Link to="/trainings" className="btn btn--ghost">
            Cancel
          </Link>
        }
      />
      <TrainingForm
        key={id}
        initialValues={initialValues}
        submitLabel="Save changes"
        onSubmit={(values) => {
          updateTraining(id, values)
          navigate('/trainings')
        }}
      />
    </div>
  )
}
