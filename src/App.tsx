import { Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { DataProvider } from './context/DataContext'
import { ProtectedRoute } from './components/ProtectedRoute'
import { AdminLayout } from './layouts/AdminLayout'
import { AuthLayout } from './layouts/AuthLayout'
import { DashboardPage } from './pages/DashboardPage'
import { LoginPage } from './pages/auth/LoginPage'
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage'
import { ResetPasswordPage } from './pages/auth/ResetPasswordPage'
import { TrainingsListPage } from './pages/trainings/TrainingsListPage'
import { CreateTrainingPage } from './pages/trainings/CreateTrainingPage'
import { TrainingFormPage } from './pages/trainings/TrainingFormPage'
import { SessionsPage } from './pages/sessions/SessionsPage'
import { EnrollmentsPage } from './pages/enrollments/EnrollmentsPage'
import { PaymentsPage } from './pages/payments/PaymentsPage'
import { ReportsPage } from './pages/reports/ReportsPage'
import { NotificationsPage } from './pages/notifications/NotificationsPage'
import { SettingsPage } from './pages/settings/SettingsPage'

export default function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <Routes>
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
          </Route>
          <Route
            element={
              <ProtectedRoute>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/" element={<DashboardPage />} />
            <Route path="/trainings" element={<TrainingsListPage />} />
            <Route path="/trainings/new" element={<CreateTrainingPage />} />
            <Route path="/trainings/:id/edit" element={<TrainingFormPage />} />
            <Route path="/sessions" element={<SessionsPage />} />
            <Route path="/enrollments" element={<EnrollmentsPage />} />
            <Route path="/payments" element={<PaymentsPage />} />
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/notifications" element={<NotificationsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </DataProvider>
    </AuthProvider>
  )
}
