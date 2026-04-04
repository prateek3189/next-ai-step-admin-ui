import { Download } from 'lucide-react'
import { PageHeader } from '../../components/PageHeader'
import { useData, paymentStatusLabel } from '../../context/DataContext'

function downloadBlob(filename: string, mime: string, text: string) {
  const blob = new Blob([text], { type: mime })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = filename
  a.click()
  URL.revokeObjectURL(a.href)
}

function toCsv(rows: (string | number)[][]): string {
  const esc = (c: string | number) => {
    const s = String(c)
    return `"${s.replace(/"/g, '""')}"`
  }
  return rows.map((r) => r.map(esc).join(',')).join('\n')
}

export function ReportsPage() {
  const {
    trainings,
    enrollments,
    payments,
    students,
    sessions,
  } = useData()

  const revenue = payments
    .filter((p) => p.payment_status === 'paid')
    .reduce((s, p) => s + p.amount, 0)

  const enrollmentByTraining = trainings.map((t) => ({
    title: t.title,
    count: enrollments.filter((e) => e.training_id === t.training_id).length,
  }))

  const attendanceBreakdown = enrollments.reduce(
    (acc, e) => {
      acc[e.attendance_status] = (acc[e.attendance_status] ?? 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  function exportRevenueCsv() {
    const rows: (string | number)[][] = [
      ['Training', 'Amount', 'Status', 'Date'],
      ...payments.map((p) => {
        const tr =
          trainings.find((t) => t.training_id === p.training_id)?.title ?? ''
        return [
          tr,
          p.amount,
          paymentStatusLabel(p.payment_status),
          p.payment_date ?? '',
        ]
      }),
    ]
    downloadBlob(
      `revenue-report-${new Date().toISOString().slice(0, 10)}.csv`,
      'text/csv;charset=utf-8',
      toCsv(rows),
    )
  }

  function exportEnrollmentCsv() {
    const rows: (string | number)[][] = [
      ['Training', 'Enrollments'],
      ...enrollmentByTraining.map((x) => [x.title, x.count]),
    ]
    downloadBlob(
      `enrollment-report-${new Date().toISOString().slice(0, 10)}.csv`,
      'text/csv;charset=utf-8',
      toCsv(rows),
    )
  }

  function exportExcelMock() {
    const xml = `<?xml version="1.0"?>
<Table>
  <Row><Cell>Metric</Cell><Cell>Value</Cell></Row>
  <Row><Cell>Total revenue (paid)</Cell><Cell>${revenue}</Cell></Row>
  <Row><Cell>Total students</Cell><Cell>${students.length}</Cell></Row>
  <Row><Cell>Total sessions</Cell><Cell>${sessions.length}</Cell></Row>
</Table>`
    downloadBlob(
      `training-performance-${new Date().toISOString().slice(0, 10)}.xml`,
      'application/xml',
      xml,
    )
  }

  function exportAttendanceCsv() {
    const rows: (string | number)[][] = [
      ['Status', 'Count'],
      ...Object.entries(attendanceBreakdown),
    ]
    downloadBlob(
      `attendance-${new Date().toISOString().slice(0, 10)}.csv`,
      'text/csv;charset=utf-8',
      toCsv(rows),
    )
  }

  return (
    <div className="page">
      <PageHeader
        title="Reports"
        description="Revenue, enrollment, performance, and attendance exports."
      />
      <div className="reports-grid">
        <article className="card report-card">
          <h2 className="card-title">Revenue report</h2>
          <p className="report-summary">
            Paid revenue (demo data):{' '}
            <strong>
              {new Intl.NumberFormat(undefined, {
                style: 'currency',
                currency: 'USD',
              }).format(revenue)}
            </strong>
          </p>
          <div className="report-actions">
            <button
              type="button"
              className="btn btn--secondary"
              onClick={exportRevenueCsv}
            >
              <Download size={17} strokeWidth={2} aria-hidden />
              Export CSV
            </button>
            <button
              type="button"
              className="btn btn--ghost"
              onClick={exportRevenueCsv}
            >
              <Download size={17} strokeWidth={2} aria-hidden />
              Export Excel (CSV)
            </button>
          </div>
        </article>
        <article className="card report-card">
          <h2 className="card-title">Enrollment report</h2>
          <ul className="report-list">
            {enrollmentByTraining.map((x) => (
              <li key={x.title}>
                {x.title}: <strong>{x.count}</strong>
              </li>
            ))}
          </ul>
          <div className="report-actions">
            <button
              type="button"
              className="btn btn--secondary"
              onClick={exportEnrollmentCsv}
            >
              <Download size={17} strokeWidth={2} aria-hidden />
              Export CSV
            </button>
          </div>
        </article>
        <article className="card report-card">
          <h2 className="card-title">Training performance</h2>
          <p className="muted">
            Aggregate metrics for sessions and published trainings. Excel export
            uses a simple XML table for demo purposes; production would use
            XLSX.
          </p>
          <div className="report-actions">
            <button
              type="button"
              className="btn btn--secondary"
              onClick={exportExcelMock}
            >
              <Download size={17} strokeWidth={2} aria-hidden />
              Export Excel (XML)
            </button>
          </div>
        </article>
        <article className="card report-card">
          <h2 className="card-title">Student attendance</h2>
          <ul className="report-list">
            {Object.entries(attendanceBreakdown).map(([k, v]) => (
              <li key={k}>
                {k}: <strong>{v}</strong>
              </li>
            ))}
          </ul>
          <div className="report-actions">
            <button
              type="button"
              className="btn btn--secondary"
              onClick={exportAttendanceCsv}
            >
              <Download size={17} strokeWidth={2} aria-hidden />
              Export CSV
            </button>
          </div>
        </article>
      </div>
    </div>
  )
}
