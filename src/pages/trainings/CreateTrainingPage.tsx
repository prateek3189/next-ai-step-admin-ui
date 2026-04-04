import { Link, useNavigate } from 'react-router-dom'
import { PageHeader } from '../../components/PageHeader'
import { useData } from '../../context/DataContext'
import {
  defaultTrainingFormValues,
  TrainingForm,
} from './TrainingForm'

export function CreateTrainingPage() {
  const navigate = useNavigate()
  const { addTraining } = useData()

  return (
    <div className="page page--full">
      <PageHeader
        title="Create training"
        description="Add a new program: details, capacity, pricing, and status."
        actions={
          <Link to="/trainings" className="btn btn--ghost">
            Cancel
          </Link>
        }
      />
      <TrainingForm
        initialValues={defaultTrainingFormValues}
        submitLabel="Create training"
        onSubmit={(values) => {
          addTraining(values)
          navigate('/trainings')
        }}
      />
    </div>
  )
}
