'use client'

import './accounts.css'
import { FormEvent, useEffect, useState } from 'react'
import { showErrorToast, showSuccessToast } from '@/components/common/toast'
import { subscriptionsService } from '@/store/api/subscriptionsApi'
import { SubscriptionFinancialYear } from '@/types/subscriptions'

export default function AccountsPage() {
  const [years, setYears] = useState<SubscriptionFinancialYear[]>([])
  const [yearLabel, setYearLabel] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [isActive, setIsActive] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  const loadFinancialYears = async () => {
    const items = await subscriptionsService.listFinancialYears()
    setYears(items)
  }

  useEffect(() => {
    loadFinancialYears().catch(() => {
      setYears([])
      showErrorToast('Unable to load financial years.')
    })
  }, [])

  const onCreate = async (event: FormEvent) => {
    event.preventDefault()
    if (!yearLabel.trim() || !startDate || !endDate) {
      showErrorToast('Year label, start date and end date are required.')
      return
    }

    setIsSaving(true)
    try {
      await subscriptionsService.createFinancialYear({
        yearLabel: yearLabel.trim(),
        startDate,
        endDate,
        active: isActive,
      })
      setYearLabel('')
      setStartDate('')
      setEndDate('')
      setIsActive(true)
      await loadFinancialYears()
      showSuccessToast('Financial year created.')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to create financial year.'
      showErrorToast(message)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="app-page">
      <div className="app-shell">
        <h1 className="app-page-title">Accounts</h1>
        <div className="app-card accounts-card">
          <h2 className="accounts-section-title">Create Financial Year</h2>
          <form className="accounts-year-form" onSubmit={onCreate}>
            <div>
              <label className="app-label">Year Label</label>
              <input
                className="app-input"
                value={yearLabel}
                onChange={event => setYearLabel(event.target.value)}
                placeholder="e.g. 2024-25"
              />
            </div>
            <div>
              <label className="app-label">Start Date</label>
              <input
                type="date"
                className="app-input"
                value={startDate}
                onChange={event => setStartDate(event.target.value)}
              />
            </div>
            <div>
              <label className="app-label">End Date</label>
              <input
                type="date"
                className="app-input"
                value={endDate}
                onChange={event => setEndDate(event.target.value)}
              />
            </div>
            <label className="accounts-active-check">
              <input
                type="checkbox"
                checked={isActive}
                onChange={event => setIsActive(event.target.checked)}
              />
              Set as active year
            </label>
            <div className="accounts-actions">
              <button className="app-btn-primary" type="submit" disabled={isSaving}>
                {isSaving ? 'Creating...' : 'Create Financial Year'}
              </button>
            </div>
          </form>
        </div>

        <div className="app-card accounts-card">
          <h2 className="accounts-section-title">Financial Years</h2>
          {years.length === 0 ? (
            <p className="app-empty-text">No financial years available. Create one to enable subscriptions.</p>
          ) : (
            <div className="accounts-year-list">
              {years.map(year => (
                <div key={year.id} className="accounts-year-item">
                  <p>
                    <strong>{year.yearLabel}</strong> ({year.startDate} to {year.endDate})
                  </p>
                  <span className={year.active ? 'accounts-year-badge-active' : 'accounts-year-badge'}>
                    {year.active ? 'Active' : 'Inactive'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
