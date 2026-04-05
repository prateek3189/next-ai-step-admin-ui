import { Pencil, Send, Trash2, Undo2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Badge } from '../../components/Badge'
import { PageHeader } from '../../components/PageHeader'
import { useData } from '../../context/DataContext'
import type { CourseStatus } from '../../types'

function statusVariant(
  s: CourseStatus,
): 'default' | 'success' | 'warning' | 'muted' {
  if (s === 'published') return 'success'
  return 'warning'
}

export function CoursesListPage() {
  const { courses, deleteCourse, setCourseStatus } = useData()

  return (
    <div className="page">
      <PageHeader
        title="Courses"
        description="Build video courses with hosted URLs or uploads. Save as draft, then publish when ready."
        actions={
          <Link to="/courses/new" className="btn btn--primary">
            New course
          </Link>
        }
      />
      <div className="table-wrap card card--flush">
        <table className="data-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Lessons</th>
              <th>Status</th>
              <th>Updated</th>
              <th aria-label="Actions" />
            </tr>
          </thead>
          <tbody>
            {courses.length === 0 ? (
              <tr>
                <td colSpan={5} className="muted">
                  No courses yet. Create one to add lessons and videos.
                </td>
              </tr>
            ) : (
              courses.map((c) => (
                <tr key={c.course_id}>
                  <td>
                    <Link to={`/courses/${c.course_id}`} className="table-link">
                      {c.title}
                    </Link>
                  </td>
                  <td>{c.lessons.length}</td>
                  <td>
                    <Badge variant={statusVariant(c.status)}>{c.status}</Badge>
                  </td>
                  <td>
                    {new Date(c.updated_at).toLocaleString(undefined, {
                      dateStyle: 'short',
                      timeStyle: 'short',
                    })}
                  </td>
                  <td className="table-actions">
                    <div className="btn-group">
                      <Link
                        to={`/courses/${c.course_id}`}
                        className="table-icon-btn"
                        aria-label={`Edit “${c.title}”`}
                        title="Edit"
                      >
                        <Pencil size={18} strokeWidth={2} aria-hidden />
                      </Link>
                      {c.status === 'draft' && (
                        <button
                          type="button"
                          className="table-icon-btn"
                          aria-label="Publish course"
                          title="Publish"
                          onClick={() =>
                            setCourseStatus(c.course_id, 'published')
                          }
                        >
                          <Send size={18} strokeWidth={2} aria-hidden />
                        </button>
                      )}
                      {c.status === 'published' && (
                        <button
                          type="button"
                          className="table-icon-btn"
                          aria-label="Unpublish course"
                          title="Move to draft"
                          onClick={() => setCourseStatus(c.course_id, 'draft')}
                        >
                          <Undo2 size={18} strokeWidth={2} aria-hidden />
                        </button>
                      )}
                      <button
                        type="button"
                        className="table-icon-btn table-icon-btn--danger"
                        aria-label="Delete course"
                        title="Delete"
                        onClick={() => {
                          if (
                            confirm(
                              `Delete “${c.title}”? This cannot be undone.`,
                            )
                          )
                            deleteCourse(c.course_id)
                        }}
                      >
                        <Trash2 size={18} strokeWidth={2} aria-hidden />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
