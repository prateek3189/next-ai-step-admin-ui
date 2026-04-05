import {
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  Plus,
  Trash2,
} from 'lucide-react'
import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useData } from '../../context/DataContext'
import { newId } from '../../utils/id'
import type { CourseLesson, CourseLessonVideo, CourseStatus } from '../../types'

const MAX_UPLOAD_BYTES = 3 * 1024 * 1024

function newEmptyLesson(index: number): CourseLesson {
  return {
    lesson_id: newId('les'),
    title: `Lesson ${index + 1}`,
    order: index,
    video: { kind: 'url', url: '' },
  }
}

function videoPreviewSrc(v: CourseLessonVideo): string | null {
  if (v.kind === 'url') {
    const u = v.url.trim()
    if (!u) return null
    return u
  }
  return v.dataUrl || null
}

function isValidVideoUrl(s: string): boolean {
  try {
    const u = new URL(s)
    return u.protocol === 'http:' || u.protocol === 'https:'
  } catch {
    return false
  }
}

function validateLessons(lessons: CourseLesson[]): string | null {
  for (const l of lessons) {
    if (!l.title.trim()) return 'Each lesson needs a title.'
    if (l.video.kind === 'url') {
      const u = l.video.url.trim()
      if (!u) return 'Each lesson needs a video URL or an uploaded file.'
      if (!isValidVideoUrl(u)) {
        return `Invalid video URL for “${l.title.trim() || 'lesson'}”.`
      }
    } else if (!l.video.dataUrl) {
      return `Upload a video file for “${l.title.trim() || 'lesson'}”, or switch to URL.`
    }
  }
  return null
}

export function CourseEditorPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { courses, addCourse, updateCourse } = useData()

  const isNew = id === 'new'
  const existing = useMemo(
    () => (!isNew && id ? courses.find((c) => c.course_id === id) : undefined),
    [courses, id, isNew],
  )

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [status, setStatus] = useState<CourseStatus>('draft')
  const [lessons, setLessons] = useState<CourseLesson[]>(() => [
    newEmptyLesson(0),
  ])
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [fileBusy, setFileBusy] = useState<string | null>(null)

  useEffect(() => {
    if (isNew) {
      setTitle('')
      setDescription('')
      setStatus('draft')
      const first = newEmptyLesson(0)
      setLessons([first])
      setSelectedLessonId(first.lesson_id)
      return
    }
    if (!existing) return
    setTitle(existing.title)
    setDescription(existing.description)
    setStatus(existing.status)
    const sorted = [...existing.lessons]
      .sort((a, b) => a.order - b.order)
      .map((l) => ({ ...l }))
    setLessons(sorted)
    setSelectedLessonId(sorted[0]?.lesson_id ?? null)
  }, [isNew, existing])

  useEffect(() => {
    if (lessons.length === 0) {
      setSelectedLessonId(null)
      return
    }
    setSelectedLessonId((cur) => {
      if (cur && lessons.some((l) => l.lesson_id === cur)) return cur
      return lessons[0]!.lesson_id
    })
  }, [lessons])

  useEffect(() => {
    if (!isNew && id && !existing) {
      navigate('/courses', { replace: true })
    }
  }, [isNew, id, existing, navigate])

  const selectedLesson = useMemo(
    () => lessons.find((l) => l.lesson_id === selectedLessonId),
    [lessons, selectedLessonId],
  )

  const selectedIndex = useMemo(
    () =>
      selectedLesson
        ? lessons.findIndex((l) => l.lesson_id === selectedLesson.lesson_id)
        : -1,
    [lessons, selectedLesson],
  )

  function setLesson(idLes: string, patch: Partial<CourseLesson>) {
    setLessons((prev) =>
      prev.map((l) => (l.lesson_id === idLes ? { ...l, ...patch } : l)),
    )
  }

  function setLessonVideo(idLes: string, video: CourseLessonVideo) {
    setLessons((prev) =>
      prev.map((l) => (l.lesson_id === idLes ? { ...l, video } : l)),
    )
  }

  function addLesson() {
    const newL = newEmptyLesson(lessons.length)
    setLessons((prev) => [...prev, newL])
    setSelectedLessonId(newL.lesson_id)
  }

  function removeLesson(lessonId: string) {
    setLessons((prev) => {
      if (prev.length <= 1) return prev
      return prev.filter((l) => l.lesson_id !== lessonId)
    })
  }

  function moveLesson(lessonId: string, dir: -1 | 1) {
    setLessons((prev) => {
      const i = prev.findIndex((l) => l.lesson_id === lessonId)
      if (i < 0) return prev
      const j = i + dir
      if (j < 0 || j >= prev.length) return prev
      const next = [...prev]
      const t = next[i]!
      next[i] = next[j]!
      next[j] = t
      return next.map((l, idx) => ({ ...l, order: idx }))
    })
  }

  function handleFileSelect(lessonId: string, file: File) {
    setError('')
    if (file.size > MAX_UPLOAD_BYTES) {
      setError(
        `“${file.name}” is over ${MAX_UPLOAD_BYTES / (1024 * 1024)}MB. Use a smaller file or paste a hosted video URL instead.`,
      )
      return
    }
    setFileBusy(lessonId)
    const reader = new FileReader()
    reader.onload = () => {
      const dataUrl =
        typeof reader.result === 'string' ? reader.result : ''
      setLessonVideo(lessonId, {
        kind: 'upload',
        fileName: file.name,
        dataUrl,
      })
      setFileBusy(null)
    }
    reader.onerror = () => {
      setError('Could not read that file.')
      setFileBusy(null)
    }
    reader.readAsDataURL(file)
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    const t = title.trim()
    if (!t) {
      setError('Course title is required.')
      return
    }
    const err = validateLessons(lessons)
    if (err) {
      setError(err)
      return
    }
    if (isNew) {
      addCourse({
        title: t,
        description: description.trim(),
        status,
        lessons,
      })
      navigate('/courses')
      return
    }
    if (!existing) return
    updateCourse(existing.course_id, {
      title: t,
      description: description.trim(),
      status,
      lessons,
    })
    navigate('/courses')
  }

  const pageTitle = isNew ? 'New course' : 'Edit course'

  const lesson = selectedLesson
  const src = lesson ? videoPreviewSrc(lesson.video) : null
  const isUrl = lesson?.video.kind === 'url'

  return (
    <div className="page page--full course-editor-page">
      <header className="page-header course-editor-page-header">
        <div className="course-editor-page-header-titles">
          <Link
            to="/courses"
            className="course-editor-back"
            aria-label="Back to courses"
            title="Back to courses"
          >
            <ArrowLeft size={22} strokeWidth={2} aria-hidden />
          </Link>
          <div>
            <h1 className="page-title">{pageTitle}</h1>
            <p className="page-description">
              Add lessons, attach video by URL (recommended for large files) or
              upload (stored in this browser for the demo).
            </p>
          </div>
        </div>
      </header>

      <form
        className="form-card card course-editor-form"
        onSubmit={handleSubmit}
      >
        <div className="course-editor-form-topbar">
          <button type="submit" className="btn btn--primary">
            {isNew ? 'Create course' : 'Save course'}
          </button>
        </div>

        {error ? (
          <p className="form-error course-editor-error" role="alert">
            {error}
          </p>
        ) : null}

        <div className="form-grid course-editor-meta">
          <label className="field field--full">
            <span className="field-label">Course title</span>
            <input
              className="input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="e.g. Advanced React"
            />
          </label>
          <label className="field field--full">
            <span className="field-label">Description</span>
            <textarea
              className="input textarea"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What learners will get from this course."
            />
          </label>
          <label className="field">
            <span className="field-label">Status</span>
            <select
              className="input"
              value={status}
              onChange={(e) =>
                setStatus(e.target.value as CourseStatus)
              }
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </label>
        </div>

        <div className="course-lessons-block">
          <div className="course-lessons-head">
            <h2 className="course-lessons-title">Lessons</h2>
            <button
              type="button"
              className="btn btn--secondary btn--sm"
              onClick={addLesson}
            >
              <Plus size={16} strokeWidth={2} aria-hidden />
              Add lesson
            </button>
          </div>

          <div className="course-lessons-split">
            <aside
              className="course-lesson-list card"
              aria-label="Lesson list"
            >
              <ul className="course-lesson-list-items">
                {lessons.map((l, idx) => {
                  const active = l.lesson_id === selectedLessonId
                  const label = l.title.trim() || `Lesson ${idx + 1}`
                  return (
                    <li key={l.lesson_id}>
                      <button
                        type="button"
                        className={
                          active
                            ? 'course-lesson-list-btn course-lesson-list-btn--active'
                            : 'course-lesson-list-btn'
                        }
                        onClick={() => setSelectedLessonId(l.lesson_id)}
                      >
                        <span className="course-lesson-list-num">
                          {idx + 1}
                        </span>
                        <span className="course-lesson-list-title">
                          {label}
                        </span>
                      </button>
                    </li>
                  )
                })}
              </ul>
            </aside>

            <div className="course-lesson-detail card">
              {lesson && selectedIndex >= 0 ? (
                <>
                  <div className="course-lesson-toolbar">
                    <span className="course-lesson-badge">
                      Lesson {selectedIndex + 1}
                    </span>
                    <div className="course-lesson-actions">
                      <button
                        type="button"
                        className="table-icon-btn"
                        disabled={selectedIndex === 0}
                        aria-label="Move lesson up"
                        onClick={() =>
                          moveLesson(lesson.lesson_id, -1)
                        }
                      >
                        <ArrowUp size={18} strokeWidth={2} />
                      </button>
                      <button
                        type="button"
                        className="table-icon-btn"
                        disabled={selectedIndex === lessons.length - 1}
                        aria-label="Move lesson down"
                        onClick={() =>
                          moveLesson(lesson.lesson_id, 1)
                        }
                      >
                        <ArrowDown size={18} strokeWidth={2} />
                      </button>
                      <button
                        type="button"
                        className="table-icon-btn table-icon-btn--danger"
                        disabled={lessons.length <= 1}
                        aria-label="Remove lesson"
                        onClick={() => removeLesson(lesson.lesson_id)}
                      >
                        <Trash2 size={18} strokeWidth={2} />
                      </button>
                    </div>
                  </div>

                  <label className="field field--full">
                    <span className="field-label">Lesson title</span>
                    <input
                      className="input"
                      value={lesson.title}
                      onChange={(e) =>
                        setLesson(lesson.lesson_id, {
                          title: e.target.value,
                        })
                      }
                      required
                    />
                  </label>

                  <fieldset className="course-video-fieldset">
                    <legend className="field-label">Video</legend>
                    <div className="course-video-mode">
                      <label className="course-radio">
                        <input
                          type="radio"
                          name={`mode-${lesson.lesson_id}`}
                          checked={isUrl}
                          onChange={() =>
                            setLessonVideo(lesson.lesson_id, {
                              kind: 'url',
                              url:
                                lesson.video.kind === 'url'
                                  ? lesson.video.url
                                  : '',
                            })
                          }
                        />
                        Video URL
                      </label>
                      <label className="course-radio">
                        <input
                          type="radio"
                          name={`mode-${lesson.lesson_id}`}
                          checked={!isUrl}
                          onChange={() =>
                            setLessonVideo(lesson.lesson_id, {
                              kind: 'upload',
                              fileName: '',
                              dataUrl: '',
                            })
                          }
                        />
                        Upload file
                      </label>
                    </div>

                    {isUrl ? (
                      <label className="field field--full">
                        <span className="field-label">URL</span>
                        <input
                          className="input"
                          type="url"
                          value={
                            lesson.video.kind === 'url'
                              ? lesson.video.url
                              : ''
                          }
                          onChange={(e) =>
                            setLessonVideo(lesson.lesson_id, {
                              kind: 'url',
                              url: e.target.value,
                            })
                          }
                          placeholder="https://…"
                        />
                      </label>
                    ) : (
                      <div className="field field--full">
                        <span className="field-label">Video file</span>
                        <input
                          className="input"
                          type="file"
                          accept="video/*"
                          disabled={fileBusy === lesson.lesson_id}
                          onChange={(e) => {
                            const f = e.target.files?.[0]
                            if (f) handleFileSelect(lesson.lesson_id, f)
                            e.target.value = ''
                          }}
                        />
                        {lesson.video.kind === 'upload' &&
                        lesson.video.fileName ? (
                          <p className="muted course-upload-meta">
                            Selected: {lesson.video.fileName}
                            {fileBusy === lesson.lesson_id
                              ? ' — reading…'
                              : ''}
                          </p>
                        ) : (
                          <p className="muted course-upload-meta">
                            Max {MAX_UPLOAD_BYTES / (1024 * 1024)}MB per file in
                            this demo. Use a URL for longer videos.
                          </p>
                        )}
                      </div>
                    )}

                    {src ? (
                      <div className="course-video-preview">
                        <video
                          className="course-video-el"
                          src={src}
                          controls
                          preload="metadata"
                        >
                          <track kind="captions" />
                          Your browser does not support video playback.
                        </video>
                      </div>
                    ) : null}
                  </fieldset>
                </>
              ) : (
                <p className="muted course-lesson-detail-empty">
                  Add a lesson or select one from the list.
                </p>
              )}
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}
