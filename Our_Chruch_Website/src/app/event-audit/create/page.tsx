'use client'

import './create-event.css'
import { useCreateEventPage } from '@/hooks/useCreateEventPage'

export default function CreateEventPage() {
  const { form, setForm, isSaving, canSubmit, submit } = useCreateEventPage()

  return (
    <div className="app-page">
      <div className="app-shell create-event-shell">
        <div className="create-event-card">
          <h1 className="create-event-title">Event details</h1>

          <form className="create-event-form" onSubmit={submit}>
            <div className="create-field">
              <label className="create-label">Name *</label>
              <p className="create-help">Name of the event</p>
              <input className="app-input" required value={form.name} onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))} />
            </div>

            <div className="create-dates">
              <div className="create-field">
                <label className="create-label">Start Date *</label>
                <p className="create-help">The date when the event will start</p>
                <input className="app-input create-date-input" required type="date" value={form.startDate} onChange={e => setForm(prev => ({ ...prev, startDate: e.target.value }))} />
              </div>

              <div className="create-field">
                <label className="create-label">End Date *</label>
                <p className="create-help">The date when the event will finish</p>
                <input className="app-input create-date-input" required type="date" value={form.endDate} onChange={e => setForm(prev => ({ ...prev, endDate: e.target.value }))} />
              </div>

              <div className="create-field">
                <label className="create-label">Description</label>
                <p className="create-help">Optional event notes</p>
                <input className="app-input" value={form.description} onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))} />
              </div>
            </div>

            <div className="create-actions">
              <button className="app-btn-primary" type="submit" disabled={isSaving || !canSubmit}>
                {isSaving ? 'Creating...' : 'Create Event'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
