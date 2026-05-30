'use client'

import './event-audit.css'
import Link from 'next/link'
import { useEventAudit } from '@/hooks/useEventAudit'

const formatDisplayDate = (rawDate?: string) => {
  if (!rawDate) return '-'
  const parsed = new Date(rawDate)
  if (Number.isNaN(parsed.getTime())) return rawDate
  return parsed.toLocaleDateString('en-GB')
}

export default function EventAuditPage() {
  const {
    events,
    selectedEventId,
    setSelectedEventId,
  } = useEventAudit()

  return (
    <div className="app-page">
      <div className="app-shell event-screen">
        <div className="event-topbar">
          <h1 className="event-title">Events</h1>
          <Link className="event-create-btn" href="/event-audit/create">
            Create new event
          </Link>
        </div>

        <div className="event-canvas">
          <div className="event-list-panel">
            <div className="event-list-header">Live and past events</div>
            {events.length === 0 ? (
              <div className="event-empty">No events yet. Create your first event.</div>
            ) : (
              <div className="event-list">
                {events.map(item => (
                  <button
                    key={item.id}
                    className={`event-row ${selectedEventId === item.id ? 'event-row-active' : ''}`}
                    onClick={() => setSelectedEventId(item.id)}
                    type="button"
                  >
                    <div className="event-row-main">
                      <div className="event-row-left">
                        <p className="event-row-live">{item.live ? `Live on ${formatDisplayDate(item.endDate)}` : `Past from ${formatDisplayDate(item.endDate)}`}</p>
                        <h3 className="event-row-name">{item.name}</h3>
                        <p className="event-row-dates">{formatDisplayDate(item.startDate)} to {formatDisplayDate(item.endDate)}</p>
                      </div>
                      <div className="event-row-right">
                        <button
                          className="event-edit-btn"
                          type="button"
                          disabled={!item.live}
                          onClick={event => {
                            event.stopPropagation()
                            setSelectedEventId(item.id)
                          }}
                        >
                          Edit
                        </button>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
