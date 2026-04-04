/**
 * Builds a Google Calendar "create event" URL from session details.
 * Uses local date/time parts combined with the session date (no timezone conversion).
 */

function pad(n: number): string {
  return n < 10 ? `0${n}` : String(n)
}

/** Parses "HH:mm" into hours and minutes */
function parseTime(t: string): { h: number; m: number } {
  const [h, m] = t.split(':').map(Number)
  return { h: h || 0, m: m || 0 }
}

/**
 * Google Calendar expects dates in UTC as YYYYMMDDTHHmmssZ
 * We treat the session's date + time as UTC for link generation consistency.
 */
export function toGoogleCalendarUtc(
  dateIso: string,
  timeStr: string,
): string {
  const [y, mo, d] = dateIso.split('-').map(Number)
  const { h, m } = parseTime(timeStr)
  return `${y}${pad(mo)}${pad(d)}T${pad(h)}${pad(m)}00Z`
}

export interface CalendarEventInput {
  title: string
  date: string
  start_time: string
  end_time: string
  description?: string
  location?: string
}

export function buildGoogleCalendarUrl(ev: CalendarEventInput): string {
  const start = toGoogleCalendarUtc(ev.date, ev.start_time)
  const end = toGoogleCalendarUtc(ev.date, ev.end_time)
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: ev.title,
    dates: `${start}/${end}`,
  })
  if (ev.description) params.set('details', ev.description)
  if (ev.location) params.set('location', ev.location)
  return `https://calendar.google.com/calendar/render?${params.toString()}`
}
