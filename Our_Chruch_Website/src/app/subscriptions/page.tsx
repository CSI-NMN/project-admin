'use client'

import './subscriptions.css'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { showErrorToast, showInfoToast, showSuccessToast } from '@/components/common/toast'
import { recordsService } from '@/store/api/recordsApi'
import { subscriptionsService } from '@/store/api/subscriptionsApi'
import { Person } from '@/types/records'
import { SubscriptionAuditItem, SubscriptionCard, SubscriptionCategoryKey, SubscriptionFinancialYear, SubscriptionTableState } from '@/types/subscriptions'
import { useAutoSave } from '@/hooks/useAutoSave'

const CATEGORY_ROWS: Array<{ key: SubscriptionCategoryKey; label: string }> = [
  { key: 'subscriptionOffering', label: 'சந்தா காணிக்கை' },
  { key: 'MensfellowshipContribution', label: 'ஆண்டு ஐக்கிய சங்கம்' },
  { key: 'womenfellowshipContribution', label: 'பெண்கள் ஐக்கிய சங்கம்' },
  { key: 'churchBuildingFund', label: 'ஆலய கட்டிட நிதி' },
  { key: 'ezhilanFund', label: 'எழிலன் நிதி' },
  { key: 'ims', label: 'I.M.S' },
  { key: 'dbm', label: 'D.B.M' },
  { key: 'fmpb', label: 'FMPB' },
  { key: 'evangelism', label: 'சுவிசேஷ ஊழியம்' },
  { key: 'elderlySupport', label: 'ஆலய முதியோர் உதவி' },
  { key: 'emaaki', label: 'எம்ஆக்கி' },
]

const formatCurrency = (value: number) => (Number.isFinite(value) ? value.toFixed(2) : '0.00')

const parseAmount = (value: string): number => {
  const amount = Number(value)
  return Number.isFinite(amount) ? amount : 0
}

const getTodayIsoDate = () => {
  const now = new Date()
  const tzOffsetMs = now.getTimezoneOffset() * 60_000
  return new Date(now.getTime() - tzOffsetMs).toISOString().slice(0, 10)
}

export default function SubscriptionsPage() {
  const months = subscriptionsService.months

  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<Person[]>([])
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null)
  const [familyMembers, setFamilyMembers] = useState<Person[]>([])
  const [years, setYears] = useState<SubscriptionFinancialYear[]>([])
  const [selectedYearId, setSelectedYearId] = useState<number | null>(null)
  const [card, setCard] = useState<SubscriptionCard | null>(null)
  const [table, setTable] = useState<SubscriptionTableState>(subscriptionsService.createEmptyTable())
  const [auditItems, setAuditItems] = useState<SubscriptionAuditItem[]>([])
  const [isDirty, setIsDirty] = useState(false)
  const [isManualSaving, setIsManualSaving] = useState(false)
  const [isCardLoading, setIsCardLoading] = useState(false)
  const [lastSavedAt, setLastSavedAt] = useState<string>('')

  useEffect(() => {
    subscriptionsService
      .listFinancialYears()
      .then(items => {
        setYears(items)
        if (items.length > 0) {
          const activeYear = items.find(item => item.active) || items[0]
          setSelectedYearId(activeYear.id)
        }
      })
      .catch(() => {
        showErrorToast('Unable to load financial years.')
      })
  }, [])

  useEffect(() => {
    const query = searchQuery.trim()
    if (!query) {
      setSearchResults([])
      return
    }
    let active = true
    subscriptionsService
      .searchPeople(query)
      .then(results => {
        if (!active) return
        setSearchResults(results)
      })
      .catch(() => {
        if (!active) return
        setSearchResults([])
      })
    return () => {
      active = false
    }
  }, [searchQuery])

  useEffect(() => {
    if (!selectedPerson?.familyId) {
      setFamilyMembers([])
      return
    }

    recordsService
      .getFamilyById(selectedPerson.familyId)
      .then(family => {
        setFamilyMembers(family.members || [])
      })
      .catch(() => {
        setFamilyMembers([])
      })
  }, [selectedPerson?.familyId])

  const canEdit = Boolean(card)

  const totalByMonth = useMemo(() => {
    return Object.fromEntries(
      months.map(month => [
        month,
        CATEGORY_ROWS.reduce((acc, row) => acc + parseAmount(table.valuesByMonth[month]?.[row.key] || '0'), 0),
      ])
    )
  }, [months, table.valuesByMonth])

  const grandTotal = useMemo(
    () => Object.values(totalByMonth).reduce((acc, current) => acc + current, 0),
    [totalByMonth]
  )

  const saveDraft = useCallback(async () => {
    if (!isDirty || !card || !selectedYearId) return
    try {
      const saved = await subscriptionsService.saveCard({
        personId: card.personId,
        financialYearId: selectedYearId,
        status: 'DRAFT',
        table,
        totalAmount: grandTotal,
        lockRecord: false,
      })
      setCard(saved)
      setLastSavedAt(saved.lastSavedAt || '')
      setIsDirty(false)
      const audit = await subscriptionsService.getAuditTrail(saved.personId, selectedYearId)
      setAuditItems(audit)
    } catch {
      showErrorToast('Auto-save failed. Please check your network.')
    }
  }, [isDirty, card, selectedYearId, table, grandTotal])

  const loadCard = async (personId: number, financialYearId: number) => {
    const loaded = await subscriptionsService.getCard(personId, financialYearId)
    setCard(loaded)
    setTable(loaded.table)
    setIsDirty(false)
    setLastSavedAt(loaded.lastSavedAt || '')
    const audit = await subscriptionsService.getAuditTrail(personId, financialYearId)
    setAuditItems(audit)
  }

  useEffect(() => {
    if (!selectedPerson || !selectedYearId) return
    setIsCardLoading(true)
    loadCard(selectedPerson.id, selectedYearId)
      .catch(() => {
        showErrorToast('Unable to load subscription card for this user/year.')
      })
      .finally(() => {
        setIsCardLoading(false)
      })
  }, [selectedPerson, selectedYearId])

  const { isSaving } = useAutoSave({
    isDirty,
    data: { card, selectedYearId, table, grandTotal },
    saveFn: saveDraft,
  })

  const updateCell = (month: string, key: SubscriptionCategoryKey, value: string) => {
    if (!canEdit) return
    setTable(prev => ({
      ...prev,
      valuesByMonth: {
        ...prev.valuesByMonth,
        [month]: {
          ...prev.valuesByMonth[month],
          [key]: value,
        },
      },
      datesByMonth: {
        ...prev.datesByMonth,
        [month]: prev.datesByMonth[month] || getTodayIsoDate(),
      },
    }))
    setIsDirty(true)
  }

  const updateDate = (month: string, value: string) => {
    if (!canEdit) return
    setTable(prev => ({
      ...prev,
      datesByMonth: { ...prev.datesByMonth, [month]: value },
    }))
    setIsDirty(true)
  }

  const handleSubmit = async () => {
    if (!card || !selectedYearId) return
    setIsManualSaving(true)
    try {
      const saved = await subscriptionsService.saveCard({
        personId: card.personId,
        financialYearId: selectedYearId,
        status: 'SUBMITTED',
        table,
        totalAmount: grandTotal,
        lockRecord: false,
      })
      setCard(saved)
      setIsDirty(false)
      setLastSavedAt(saved.lastSavedAt || '')
      const audit = await subscriptionsService.getAuditTrail(saved.personId, selectedYearId)
      setAuditItems(audit)
      showSuccessToast('Subscription card submitted successfully.')
    } catch {
      showErrorToast('Unable to submit subscription card.')
    } finally {
      setIsManualSaving(false)
    }
  }

  const handleFamilyBulkUpdate = async () => {
    if (!card || !selectedYearId) return
    setIsManualSaving(true)
    try {
      const updatedCount = await subscriptionsService.updateFamilyContributions({
        familyId: card.familyId,
        financialYearId: selectedYearId,
        table,
        totalAmount: grandTotal,
      })
      const audit = await subscriptionsService.getAuditTrail(card.personId, selectedYearId)
      setAuditItems(audit)
      showSuccessToast(`Updated ${updatedCount} family member card(s).`)
    } catch {
      showErrorToast('Unable to update family contributions.')
    } finally {
      setIsManualSaving(false)
    }
  }

  return (
    <div className="app-page">
      <div className="app-shell">
        <div className="subscriptions-header">
          <div>
            <h1 className="app-page-title">Subscriptions</h1>
            <p className="subscriptions-subtitle">Digitized santha card management with auto-save and yearly tracking.</p>
          </div>
        </div>

        <div className="app-card subscriptions-search-card">
          <div className="subscriptions-search-row">
            <input
              className="app-input"
              value={searchQuery}
              onChange={event => setSearchQuery(event.target.value)}
              placeholder="Search by name, member no, phone, Aadhaar..."
            />
          </div>

          {searchResults.length > 0 && (
            <div className="subscriptions-result-list">
              {searchResults.map(result => (
                <button
                  key={result.id}
                  className="subscriptions-result-item"
                  onClick={() => {
                    setSelectedPerson(result)
                    setSearchResults([])
                    setSearchQuery(`${result.firstName} ${result.lastName || ''}`.trim())
                    if (!selectedYearId) {
                      showInfoToast('Select a financial year to load the subscription card.')
                    }
                  }}
                >
                  {result.firstName} {result.lastName || ''} - Subscription ID: {result.memberNo || 'NA'}
                </button>
              ))}
            </div>
          )}
        </div>

        {selectedPerson && (
          <div className="app-card subscriptions-grid-card">
            <div className="subscriptions-card-meta">
              <div className="subscriptions-card-meta-top">
                <p>
                  <strong>Financial Year</strong>
                </p>
                <select
                  className="app-input subscriptions-year-select"
                  value={selectedYearId ?? ''}
                  onChange={event => setSelectedYearId(Number(event.target.value))}
                >
                  <option value="" disabled>
                    Select Financial Year
                  </option>
                  {years.map(year => (
                    <option key={year.id} value={year.id}>
                      {year.yearLabel}
                    </option>
                  ))}
                </select>
              </div>
              {familyMembers.length > 0 && (
                <div className="subscriptions-card-meta-top">
                  <p>
                    <strong>Family Member</strong>
                  </p>
                  <select
                    className="app-input subscriptions-year-select"
                    value={selectedPerson.id}
                    onChange={event => {
                      const targetId = Number(event.target.value)
                      const member = familyMembers.find(item => item.id === targetId)
                      if (!member) return
                      setSelectedPerson(member)
                      setSearchQuery(`${member.firstName} ${member.lastName || ''}`.trim())
                    }}
                  >
                    {familyMembers.map(member => (
                      <option key={member.id} value={member.id}>
                        {member.firstName} {member.lastName || ''} ({member.memberNo || 'NA'})
                      </option>
                    ))}
                  </select>
                </div>
              )}
              <p>
                <strong>Person:</strong> {selectedPerson.firstName} {selectedPerson.lastName || ''}{' '}
                <strong>Subscription ID:</strong> {selectedPerson.memberNo || 'NA'}
              </p>
            </div>

            {!selectedYearId && (
              <div className="app-info-banner">
                <p className="app-info-text">Select a financial year to load the selected user card.</p>
              </div>
            )}
          </div>
        )}

        {isCardLoading && (
          <div className="app-card subscriptions-grid-card">
            <p className="app-empty-text">Loading subscription card...</p>
          </div>
        )}

        {card && selectedYearId && (
          <div className="app-card subscriptions-grid-card">
            <div className="subscriptions-card-meta">
              <p>
                <strong>Person:</strong> {card.personName || selectedPerson?.firstName} | <strong>Family:</strong> {card.familyName}
              </p>
              <p>
                <strong>Financial Year:</strong> {card.financialYearLabel} | <strong>Status:</strong> {card.status}
              </p>
              <p className="subscriptions-save-info">
                {isSaving || isManualSaving ? 'Saving...' : 'Saved'} {lastSavedAt ? `at ${new Date(lastSavedAt).toLocaleString()}` : ''}
              </p>
            </div>

            <div className="subscriptions-table-wrap">
              <table className="subscriptions-table">
                <thead>
                  <tr>
                    <th>விபரம்</th>
                    {months.map(month => (
                      <th key={month}>{month}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {CATEGORY_ROWS.map(row => (
                    <tr key={row.key}>
                      <td>{row.label}</td>
                      {months.map(month => (
                        <td key={`${row.key}-${month}`}>
                          <input
                            type="number"
                            className="subscriptions-cell-input"
                            value={table.valuesByMonth[month]?.[row.key] || ''}
                            onChange={event => updateCell(month, row.key, event.target.value)}
                            readOnly={!canEdit}
                          />
                        </td>
                      ))}
                    </tr>
                  ))}
                  <tr className="subscriptions-total-row">
                    <td>மொத்தம்</td>
                    {months.map(month => (
                      <td key={`total-${month}`}>{formatCurrency(totalByMonth[month] || 0)}</td>
                    ))}
                  </tr>
                  <tr>
                    <td>தேதி</td>
                    {months.map(month => (
                      <td key={`date-${month}`}>
                        <input
                          type="date"
                          className="subscriptions-cell-input"
                          value={table.datesByMonth[month] || ''}
                          onChange={event => updateDate(month, event.target.value)}
                          readOnly={!canEdit}
                        />
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="subscriptions-footer">
              <div className="subscriptions-actions">
                <button className="app-btn-secondary" onClick={handleFamilyBulkUpdate} disabled={!card || isSaving || isManualSaving}>
                  Update Family Contributions
                </button>
                <button className="app-btn-primary" onClick={handleSubmit} disabled={!card || isSaving || isManualSaving || !canEdit}>
                  Submit
                </button>
              </div>
            </div>
          </div>
        )}

        {card && selectedYearId && (
          <div className="app-card subscriptions-grid-card">
            <div className="subscriptions-card-meta">
              <p>
                <strong>Audit Log</strong>
              </p>
            </div>
            {auditItems.length === 0 ? (
              <p className="app-empty-text">No audit entries yet for this person and financial year.</p>
            ) : (
              <div className="subscriptions-audit-wrap">
                <table className="subscriptions-audit-table">
                  <thead>
                    <tr>
                      <th>Time</th>
                      <th>Type</th>
                      <th>Month</th>
                      <th>Field</th>
                      <th>Old</th>
                      <th>New</th>
                    </tr>
                  </thead>
                  <tbody>
                    {auditItems.map(item => (
                      <tr key={item.id}>
                        <td>{new Date(item.createdAt).toLocaleString()}</td>
                        <td>{item.type}</td>
                        <td>{item.month || '-'}</td>
                        <td>{item.fieldName}</td>
                        <td>{item.oldValue || '-'}</td>
                        <td>{item.newValue || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
