import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import {
  seedEnrollments,
  seedNotifications,
  seedPayments,
  seedSessions,
  seedStudents,
  seedTrainings,
} from '../data/seed'
import { newId } from '../utils/id'
import type {
  AttendanceStatus,
  Enrollment,
  NotificationLog,
  Payment,
  PaymentStatus,
  Session,
  Student,
  Training,
  TrainingStatus,
} from '../types'

interface DataContextValue {
  students: Student[]
  trainings: Training[]
  sessions: Session[]
  enrollments: Enrollment[]
  payments: Payment[]
  notifications: NotificationLog[]
  addTraining: (t: Omit<Training, 'training_id' | 'created_at'>) => Training
  updateTraining: (id: string, patch: Partial<Training>) => void
  deleteTraining: (id: string) => void
  setTrainingStatus: (id: string, status: TrainingStatus) => void
  addSession: (s: Omit<Session, 'session_id'>) => Session
  updateSession: (id: string, patch: Partial<Session>) => void
  deleteSession: (id: string) => void
  reorderSessions: (trainingId: string, orderedIds: string[]) => void
  removeEnrollment: (enrollmentId: string) => void
  setEnrollmentAttendance: (
    enrollmentId: string,
    status: AttendanceStatus,
  ) => void
  updatePayment: (paymentId: string, patch: Partial<Payment>) => void
  sendNotification: (
    n: Omit<
      NotificationLog,
      'notification_id' | 'sent_at' | 'recipient_count'
    > & { recipient_count?: number },
  ) => void
}

const DataContext = createContext<DataContextValue | null>(null)

export function DataProvider({ children }: { children: ReactNode }) {
  const [students] = useState<Student[]>(() => [...seedStudents])
  const [trainings, setTrainings] = useState<Training[]>(() => [
    ...seedTrainings,
  ])
  const [sessions, setSessions] = useState<Session[]>(() => [...seedSessions])
  const [enrollments, setEnrollments] = useState<Enrollment[]>(() => [
    ...seedEnrollments,
  ])
  const [payments, setPayments] = useState<Payment[]>(() => [...seedPayments])
  const [notifications, setNotifications] = useState<NotificationLog[]>(
    () => [...seedNotifications],
  )

  const addTraining = useCallback(
    (t: Omit<Training, 'training_id' | 'created_at'>) => {
      const created: Training = {
        ...t,
        training_id: newId('trn'),
        created_at: new Date().toISOString(),
      }
      setTrainings((prev) => [...prev, created])
      return created
    },
    [],
  )

  const updateTraining = useCallback((id: string, patch: Partial<Training>) => {
    setTrainings((prev) =>
      prev.map((x) => (x.training_id === id ? { ...x, ...patch } : x)),
    )
  }, [])

  const deleteTraining = useCallback((id: string) => {
    setTrainings((prev) => prev.filter((x) => x.training_id !== id))
    setSessions((prev) => prev.filter((s) => s.training_id !== id))
    setEnrollments((prev) => prev.filter((e) => e.training_id !== id))
    setPayments((prev) => prev.filter((p) => p.training_id !== id))
  }, [])

  const setTrainingStatus = useCallback((id: string, status: TrainingStatus) => {
    updateTraining(id, { status })
  }, [updateTraining])

  const addSession = useCallback((s: Omit<Session, 'session_id'>) => {
    const created: Session = { ...s, session_id: newId('ses') }
    setSessions((prev) => [...prev, created])
    return created
  }, [])

  const updateSession = useCallback((id: string, patch: Partial<Session>) => {
    setSessions((prev) =>
      prev.map((x) => (x.session_id === id ? { ...x, ...patch } : x)),
    )
  }, [])

  const deleteSession = useCallback((id: string) => {
    setSessions((prev) => prev.filter((x) => x.session_id !== id))
  }, [])

  const reorderSessions = useCallback(
    (trainingId: string, orderedIds: string[]) => {
      setSessions((prev) =>
        prev.map((s) => {
          if (s.training_id !== trainingId) return s
          const idx = orderedIds.indexOf(s.session_id)
          if (idx === -1) return s
          return { ...s, order: idx }
        }),
      )
    },
    [],
  )

  const removeEnrollment = useCallback((enrollmentId: string) => {
    setEnrollments((prev) => prev.filter((e) => e.enrollment_id !== enrollmentId))
  }, [])

  const setEnrollmentAttendance = useCallback(
    (enrollmentId: string, status: AttendanceStatus) => {
      setEnrollments((prev) =>
        prev.map((e) =>
          e.enrollment_id === enrollmentId ? { ...e, attendance_status: status } : e,
        ),
      )
    },
    [],
  )

  const updatePayment = useCallback(
    (paymentId: string, patch: Partial<Payment>) => {
      setPayments((prev) =>
        prev.map((p) =>
          p.payment_id === paymentId ? { ...p, ...patch } : p,
        ),
      )
    },
    [],
  )

  const sendNotification = useCallback(
    (
      n: Omit<
        NotificationLog,
        'notification_id' | 'sent_at' | 'recipient_count'
      > & { recipient_count?: number },
    ) => {
      const log: NotificationLog = {
        ...n,
        notification_id: newId('ntf'),
        sent_at: new Date().toISOString(),
        recipient_count: n.recipient_count ?? 0,
      }
      setNotifications((prev) => [log, ...prev])
    },
    [],
  )

  const value = useMemo(
    () => ({
      students,
      trainings,
      sessions,
      enrollments,
      payments,
      notifications,
      addTraining,
      updateTraining,
      deleteTraining,
      setTrainingStatus,
      addSession,
      updateSession,
      deleteSession,
      reorderSessions,
      removeEnrollment,
      setEnrollmentAttendance,
      updatePayment,
      sendNotification,
    }),
    [
      students,
      trainings,
      sessions,
      enrollments,
      payments,
      notifications,
      addTraining,
      updateTraining,
      deleteTraining,
      setTrainingStatus,
      addSession,
      updateSession,
      deleteSession,
      reorderSessions,
      removeEnrollment,
      setEnrollmentAttendance,
      updatePayment,
      sendNotification,
    ],
  )

  return (
    <DataContext.Provider value={value}>{children}</DataContext.Provider>
  )
}

export function useData(): DataContextValue {
  const ctx = useContext(DataContext)
  if (!ctx) throw new Error('useData must be used within DataProvider')
  return ctx
}

/** Helpers used by dashboard / exports */
export function paymentStatusLabel(s: PaymentStatus): string {
  const map: Record<PaymentStatus, string> = {
    pending: 'Pending',
    paid: 'Paid',
    failed: 'Failed',
    refunded: 'Refunded',
  }
  return map[s]
}
