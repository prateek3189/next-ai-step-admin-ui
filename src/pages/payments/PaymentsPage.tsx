import { CheckCircle2, Undo2 } from 'lucide-react'
import { PageHeader } from '../../components/PageHeader'
import { Badge } from '../../components/Badge'
import { useData, paymentStatusLabel } from '../../context/DataContext'

export function PaymentsPage() {
  const { payments, students, trainings, updatePayment } = useData()

  const rows = payments.map((p) => ({
    p,
    student: students.find((s) => s.student_id === p.student_id)?.name ?? '—',
    training:
      trainings.find((t) => t.training_id === p.training_id)?.title ?? '—',
  }))

  return (
    <div className="page">
      <PageHeader
        title="Payments"
        description="Track transactions, record manual payments, and process refunds."
      />
      <div className="table-wrap card card--flush">
        <table className="data-table">
          <thead>
            <tr>
              <th>Student</th>
              <th>Training</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Method</th>
              <th>Transaction</th>
              <th>Payment date</th>
              <th aria-label="Actions" />
            </tr>
          </thead>
          <tbody>
            {rows.map(({ p, student, training }) => (
              <tr key={p.payment_id}>
                <td>{student}</td>
                <td>{training}</td>
                <td>${p.amount}</td>
                <td>
                  <Badge
                    variant={
                      p.payment_status === 'paid'
                        ? 'success'
                        : p.payment_status === 'pending'
                          ? 'warning'
                          : p.payment_status === 'refunded'
                            ? 'muted'
                            : 'danger'
                    }
                  >
                    {paymentStatusLabel(p.payment_status)}
                  </Badge>
                </td>
                <td>{p.payment_method}</td>
                <td>
                  <code className="code-inline">{p.transaction_id}</code>
                </td>
                <td>
                  {p.payment_date
                    ? new Date(p.payment_date).toLocaleString()
                    : '—'}
                </td>
                <td className="table-actions">
                  <div className="btn-group">
                    {p.payment_status === 'pending' && (
                      <button
                        type="button"
                        className="table-icon-btn"
                        aria-label="Mark paid (manual)"
                        title="Mark paid (manual)"
                        onClick={() =>
                          updatePayment(p.payment_id, {
                            payment_status: 'paid',
                            payment_method: 'Manual',
                            transaction_id: `manual_${newId()}`,
                            payment_date: new Date().toISOString(),
                          })
                        }
                      >
                        <CheckCircle2 size={18} strokeWidth={2} aria-hidden />
                      </button>
                    )}
                    {p.payment_status === 'paid' && (
                      <button
                        type="button"
                        className="table-icon-btn"
                        aria-label="Refund payment"
                        title="Refund"
                        onClick={() =>
                          updatePayment(p.payment_id, {
                            payment_status: 'refunded',
                          })
                        }
                      >
                        <Undo2 size={18} strokeWidth={2} aria-hidden />
                      </button>
                    )}
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

function newId(): string {
  return crypto.randomUUID().slice(0, 8)
}
