import { Link } from 'react-router-dom'
import { Badge } from '../components/Badge'
import { PageHeader } from '../components/PageHeader'
import { StatCard } from '../components/StatCard'
import { useData, paymentStatusLabel } from '../context/DataContext'

function formatMoney(n: number): string {
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(n)
}

export function DashboardPage() {
  const {
    trainings,
    sessions,
    enrollments,
    payments,
    students,
  } = useData()

  const totalTrainings = trainings.length
  const totalStudents = students.length
  const activeTrainings = trainings.filter(
    (t) => t.status === 'published',
  ).length
  const today = new Date().toISOString().slice(0, 10)
  const upcomingSessionCount = sessions.filter((s) => s.date >= today).length

  const revenue = payments
    .filter((p) => p.payment_status === 'paid')
    .reduce((sum, p) => sum + p.amount, 0)

  const upcomingRows = sessions
    .filter((s) => s.date >= today)
    .sort(
      (a, b) =>
        a.date.localeCompare(b.date) || a.start_time.localeCompare(b.start_time),
    )
    .slice(0, 12)

  const recentEnrollments = [...enrollments]
    .sort((a, b) => b.enrollment_date.localeCompare(a.enrollment_date))
    .slice(0, 12)

  const paymentCounts = payments.reduce(
    (acc, p) => {
      acc[p.payment_status] = (acc[p.payment_status] ?? 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  const paymentOverviewRows = (
    ['paid', 'pending', 'failed', 'refunded'] as const
  ).map((k) => ({
    status: k,
    label: paymentStatusLabel(k),
    count: paymentCounts[k] ?? 0,
  }))

  return (
    <div className="page page--full dashboard-page">
      <PageHeader
        title="Dashboard"
        description="Overview of trainings, enrollments, and revenue."
      />

      <section className="dashboard-block" aria-labelledby="dash-stats-heading">
        <h2 id="dash-stats-heading" className="dashboard-block-title">
          Stats
        </h2>
        <div className="stat-grid stat-grid--full">
          <StatCard label="Total trainings" value={totalTrainings} />
          <StatCard label="Total students" value={totalStudents} />
          <StatCard label="Active trainings" value={activeTrainings} />
          <StatCard label="Upcoming sessions" value={upcomingSessionCount} />
          <StatCard label="Revenue (paid)" value={formatMoney(revenue)} />
        </div>
      </section>

      <section
        className="dashboard-block"
        aria-labelledby="dash-upcoming-heading"
      >
        <div className="dashboard-block-head">
          <h2 id="dash-upcoming-heading" className="dashboard-block-title">
            Upcoming trainings
          </h2>
          <Link to="/sessions" className="dashboard-block-link">
            View all sessions
          </Link>
        </div>
        <div className="card card--flush udemy-table-card">
          <div className="table-wrap">
            <table className="data-table data-table--dashboard">
              <thead>
                <tr>
                  <th>Training</th>
                  <th>Session</th>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Mode</th>
                  <th>Instructor</th>
                </tr>
              </thead>
              <tbody>
                {upcomingRows.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="data-table-empty">
                      No upcoming sessions scheduled.
                    </td>
                  </tr>
                ) : (
                  upcomingRows.map((s) => {
                    const t = trainings.find(
                      (x) => x.training_id === s.training_id,
                    )
                    return (
                      <tr key={s.session_id}>
                        <td>
                          <span className="table-cell-strong">
                            {t?.title ?? '—'}
                          </span>
                        </td>
                        <td>{s.title}</td>
                        <td>{s.date}</td>
                        <td>
                          {s.start_time} – {s.end_time}
                        </td>
                        <td>
                          <Badge variant="muted">{s.mode}</Badge>
                        </td>
                        <td>{s.instructor}</td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section
        className="dashboard-block"
        aria-labelledby="dash-enroll-heading"
      >
        <div className="dashboard-block-head">
          <h2 id="dash-enroll-heading" className="dashboard-block-title">
            Recent enrollment
          </h2>
          <Link to="/enrollments" className="dashboard-block-link">
            View all enrollments
          </Link>
        </div>
        <div className="card card--flush udemy-table-card">
          <div className="table-wrap">
            <table className="data-table data-table--dashboard">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Email</th>
                  <th>Training</th>
                  <th>Enrollment date</th>
                  <th>Payment status</th>
                </tr>
              </thead>
              <tbody>
                {recentEnrollments.map((e) => {
                  const st = students.find((x) => x.student_id === e.student_id)
                  const tr = trainings.find(
                    (x) => x.training_id === e.training_id,
                  )
                  return (
                    <tr key={e.enrollment_id}>
                      <td>
                        <span className="table-cell-strong">
                          {st?.name ?? '—'}
                        </span>
                      </td>
                      <td>{st?.email ?? '—'}</td>
                      <td>{tr?.title ?? '—'}</td>
                      <td>
                        {new Date(e.enrollment_date).toLocaleString()}
                      </td>
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
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section
        className="dashboard-block"
        aria-labelledby="dash-pay-heading"
      >
        <div className="dashboard-block-head">
          <h2 id="dash-pay-heading" className="dashboard-block-title">
            Payment status overview
          </h2>
          <Link to="/payments" className="dashboard-block-link">
            View all payments
          </Link>
        </div>
        <div className="card card--flush udemy-table-card">
          <div className="table-wrap">
            <table className="data-table data-table--dashboard">
              <thead>
                <tr>
                  <th>Payment status</th>
                  <th>Count</th>
                </tr>
              </thead>
              <tbody>
                {paymentOverviewRows.map((row) => (
                  <tr key={row.status}>
                    <td>
                      <Badge
                        variant={
                          row.status === 'paid'
                            ? 'success'
                            : row.status === 'pending'
                              ? 'warning'
                              : row.status === 'failed'
                                ? 'danger'
                                : 'muted'
                        }
                      >
                        {row.label}
                      </Badge>
                    </td>
                    <td>
                      <span className="table-cell-strong">{row.count}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  )
}
