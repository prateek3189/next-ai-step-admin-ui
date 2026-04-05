export type TrainingStatus = 'draft' | 'published' | 'closed' | 'archived'
export type TrainingType = 'online' | 'offline' | 'hybrid'
export type SessionMode = 'online' | 'offline'
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded'
export type AttendanceStatus = 'present' | 'absent' | 'pending' | 'late'

export interface Training {
  training_id: string
  title: string
  description: string
  category: string
  trainer_name: string
  duration: string
  price: number
  max_seats: number
  type: TrainingType
  status: TrainingStatus
  thumbnail?: string
  created_at: string
}

export interface Session {
  session_id: string
  training_id: string
  title: string
  date: string
  start_time: string
  end_time: string
  mode: SessionMode
  meeting_link?: string
  location?: string
  instructor: string
  notes?: string
  order: number
}

export interface Student {
  student_id: string
  name: string
  email: string
  phone: string
}

export interface Enrollment {
  enrollment_id: string
  student_id: string
  training_id: string
  payment_status: PaymentStatus
  enrollment_date: string
  attendance_status: AttendanceStatus
}

export interface Payment {
  payment_id: string
  student_id: string
  training_id: string
  amount: number
  payment_status: PaymentStatus
  payment_method: string
  transaction_id: string
  payment_date: string | null
}

export interface NotificationLog {
  notification_id: string
  channel: 'email' | 'in_app'
  event_type: string
  subject: string
  body: string
  training_id: string | null
  sent_at: string
  recipient_count: number
}

export type CourseStatus = 'draft' | 'published'

/** URL stream, or uploaded file stored as data URL (demo; size-limited). */
export type CourseLessonVideo =
  | { kind: 'url'; url: string }
  | { kind: 'upload'; fileName: string; dataUrl: string }

export interface CourseLesson {
  lesson_id: string
  title: string
  order: number
  video: CourseLessonVideo
}

export interface Course {
  course_id: string
  title: string
  description: string
  status: CourseStatus
  lessons: CourseLesson[]
  created_at: string
  updated_at: string
}
