import { Download, Trash2 } from 'lucide-react'
import { PageHeader } from '../../components/PageHeader'
import { Badge } from '../../components/Badge'
import { useData, paymentStatusLabel } from '../../context/DataContext'
import type { AttendanceStatus } from '../../types'

function exportCsv(rows: string[][]) {
  const esc = (c: string) =>
    `"${c.replace(/"/g, '""')}"`
  const line = rows.map((r) => r.map(esc).join(',')).join('\n')
  const blob = new Blob([line], { type: 'text/csv;charset=utf-8' })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = `enrollments-${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(a.href)
}

export function EnrollmentsPage() {
  const {
    enrollments,
    students,
    trainings,
    removeEnrollment,
    setEnrollmentAttendance,
  } = useData()

  const rows = enrollments.map((e) => {
    const st = students.find((s) => s.student_id === e.student_id)
    const tr = trainings.find((t) => t.training_id === e.training_id)
    return {
      e,
      studentName: st?.name ?? '—',
      email: st?.email ?? '—',
      phone: st?.phone ?? '—',
      trainingName: tr?.title ?? '—',
    }
  })

  function handleExport() {
    exportCsv([
      [
        'Student name',
        'Email',
        'Phone',
        'Training',
        'Enrollment date',
        'Payment status',
        'Attendance',
      ],
      ...rows.map((r) => [
        r.studentName,
        r.email,
        r.phone,
        r.trainingName,
        new Date(r.e.enrollment_date).toISOString(),
        r.e.payment_status,
        r.e.attendance_status,
      ]),
    ])
  }

  return (
    <div className="page">
      <PageHeader
        title="Enrollments"
        description="View enrollments, attendance, and export student lists."
        actions={
          <button type="button" className="btn btn--secondary" onClick={handleExport}>
            <Download size={17} strokeWidth={2} aria-hidden />
            Export CSV
          </button>
        }
      />
      <div className="table-wrap card card--flush">
        <table className="data-table">
          <thead>
            <tr>
              <th>Student</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Training</th>
              <th>Enrolled</th>
              <th>Payment</th>
              <th>Attendance</th>
              <th aria-label="Actions" />
            </tr>
          </thead>
          <tbody>
            {rows.map(({ e, studentName, email, phone, trainingName }) => (
              <tr key={e.enrollment_id}>
                <td>{studentName}</td>
                <td>{email}</td>
                <td>{phone}</td>
                <td>{trainingName}</td>
                <td>{new Date(e.enrollment_date).toLocaleString()}</td>
                <td>
                  <Badge
                    variant={
                      e.payment_status === 'paid'
                        ? 'success'
                        : e.payment_status === 'pending'
                          ? 'warning'
                          : 'default'
                    }
                  >
                    {paymentStatusLabel(e.payment_status)}
                  </Badge>
                </td>
                <td>
                  <select
                    className="input input--sm"
                    value={e.attendance_status}
                    onChange={(ev) =>
                      setEnrollmentAttendance(
                        e.enrollment_id,
                        ev.target.value as AttendanceStatus,
                      )
                    }
                  >
                    <option value="pending">Pending</option>
                    <option value="present">Present</option>
                    <option value="absent">Absent</option>
                    <option value="late">Late</option>
                  </select>
                </td>
                <td className="table-actions">
                  <div className="btn-group">
                    <button
                      type="button"
                      className="table-icon-btn table-icon-btn--danger"
                      aria-label="Remove enrollment"
                      title="Remove"
                      onClick={() => {
                        if (confirm('Remove this enrollment?'))
                          removeEnrollment(e.enrollment_id)
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
