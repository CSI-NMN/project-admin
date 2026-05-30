'use client'

import './tally.css'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { showErrorToast } from '@/components/common/toast'
import { subscriptionsService } from '@/store/api/subscriptionsApi'
import { tallyService } from '@/store/api/tallyApi'
import { SubscriptionFinancialYear } from '@/types/subscriptions'
import { TallyData, TallyTableState, TallyCategory } from '@/types/tally'
import { useAutoSave } from '@/hooks/useAutoSave'

const MONTHS = ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar']

export default function TallyPage() {
  const [years, setYears] = useState<SubscriptionFinancialYear[]>([])
  const [selectedYearId, setSelectedYearId] = useState<number | null>(null)
  const [selectedMonth, setSelectedMonth] = useState<string>('Apr')
  const [tally, setTally] = useState<TallyData | null>(null)
  const [incomeTable, setIncomeTable] = useState<TallyTableState>({ categories: [] })
  const [expenseTable, setExpenseTable] = useState<TallyTableState>({ categories: [] })
  const [isDirty, setIsDirty] = useState(false)
  const [isManualSaving, setIsManualSaving] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

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

  const totalIncome = useMemo(
    () => incomeTable.categories.reduce((sum, cat) => sum + cat.amount, 0),
    [incomeTable.categories]
  )

  const totalExpense = useMemo(
    () => expenseTable.categories.reduce((sum, cat) => sum + cat.amount, 0),
    [expenseTable.categories]
  )

  const saveTally = useCallback(async () => {
    if (!isDirty || !selectedYearId) return
    try {
      const saved = await tallyService.saveTally({
        financialYearId: selectedYearId,
        month: selectedMonth,
        income: incomeTable,
        expense: expenseTable,
        totalIncome,
        totalExpense,
      })
      setTally(saved)
      setIsDirty(false)
    } catch {
      showErrorToast('Auto-save failed. Please check your network.')
    }
  }, [isDirty, selectedYearId, selectedMonth, incomeTable, expenseTable, totalIncome, totalExpense])

  const { isSaving } = useAutoSave({
    isDirty,
    data: { selectedYearId, selectedMonth, incomeTable, expenseTable, totalIncome, totalExpense },
    saveFn: saveTally,
  })

  useEffect(() => {
    if (!selectedYearId) return
    setIsLoading(true)
    tallyService
      .getTally(selectedYearId, selectedMonth)
      .then(data => {
        setTally(data)
        setIncomeTable(data.income)
        setExpenseTable(data.expense)
        setIsDirty(false)
      })
      .catch(() => {
        showErrorToast('Unable to load tally data.')
      })
      .finally(() => {
        setIsLoading(false)
      })
  }, [selectedYearId, selectedMonth])

  const updateIncomeAmount = (index: number, amount: number) => {
    if (!incomeTable.categories[index].editable) return
    setIncomeTable(prev => ({
      ...prev,
      categories: prev.categories.map((cat, i) =>
        i === index ? { ...cat, amount } : cat
      ),
    }))
    setIsDirty(true)
  }

  const updateIncomeReason = (index: number, reason: string) => {
    if (!incomeTable.categories[index].editable) return
    setIncomeTable(prev => ({
      ...prev,
      categories: prev.categories.map((cat, i) =>
        i === index ? { ...cat, reason } : cat
      ),
    }))
    setIsDirty(true)
  }

  const updateExpenseAmount = (index: number, amount: number) => {
    if (!expenseTable.categories[index].editable) return
    setExpenseTable(prev => ({
      ...prev,
      categories: prev.categories.map((cat, i) =>
        i === index ? { ...cat, amount } : cat
      ),
    }))
    setIsDirty(true)
  }

  const updateExpenseReason = (index: number, reason: string) => {
    if (!expenseTable.categories[index].editable) return
    setExpenseTable(prev => ({
      ...prev,
      categories: prev.categories.map((cat, i) =>
        i === index ? { ...cat, reason } : cat
      ),
    }))
    setIsDirty(true)
  }

  const addIncomeCategory = () => {
    setIncomeTable(prev => ({
      ...prev,
      categories: [
        ...prev.categories,
        {
          key: `income_${Date.now()}`,
          label: 'New Income',
          amount: 0,
          reason: '',
          editable: true,
        },
      ],
    }))
    setIsDirty(true)
  }

  const addExpenseCategory = () => {
    setExpenseTable(prev => ({
      ...prev,
      categories: [
        ...prev.categories,
        {
          key: `expense_${Date.now()}`,
          label: 'New Expense',
          amount: 0,
          reason: '',
          editable: true,
        },
      ],
    }))
    setIsDirty(true)
  }

  const removeIncomeCategory = (index: number) => {
    setIncomeTable(prev => ({
      ...prev,
      categories: prev.categories.filter((_, i) => i !== index),
    }))
    setIsDirty(true)
  }

  const removeExpenseCategory = (index: number) => {
    setExpenseTable(prev => ({
      ...prev,
      categories: prev.categories.filter((_, i) => i !== index),
    }))
    setIsDirty(true)
  }

  const formatCurrency = (value: number) => (Number.isFinite(value) ? value.toFixed(2) : '0.00')

  if (isLoading) {
    return (
      <div className="app-page">
        <div className="app-shell">
          <p className="app-empty-text">Loading tally data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="app-page">
      <div className="app-shell">
        <div className="tally-header">
          <h1 className="app-page-title">Monthly Tally</h1>
          <div className="tally-controls">
            <select
              className="app-input"
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
            <select
              className="app-input"
              value={selectedMonth}
              onChange={event => setSelectedMonth(event.target.value)}
            >
              {MONTHS.map(month => (
                <option key={month} value={month}>
                  {month}
                </option>
              ))}
            </select>
            <div className="tally-save-info">
              {isSaving || isManualSaving ? 'Saving...' : 'Saved'} {tally?.lastSavedAt ? `at ${new Date(tally.lastSavedAt).toLocaleString()}` : ''}
            </div>
          </div>
        </div>

        <div className="tally-layout">
          <div className="tally-section">
            <h3>Income</h3>
            <table className="tally-table">
              <thead>
                <tr>
                  <th>Category</th>
                  <th>Amount</th>
                  <th>Reason</th>
                  <th style={{ width: '50px' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {incomeTable.categories.map((category, index) => (
                  <tr key={category.key}>
                    <td>{category.label}</td>
                    <td>
                      <input
                        type="number"
                        className="tally-cell-input"
                        value={category.amount}
                        onChange={event => updateIncomeAmount(index, Number(event.target.value) || 0)}
                        readOnly={!category.editable}
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        className="tally-cell-input"
                        value={category.reason}
                        onChange={event => updateIncomeReason(index, event.target.value)}
                        readOnly={!category.editable}
                        placeholder="Reason..."
                      />
                    </td>
                    <td>
                      {category.editable && (
                        <button
                          className="app-btn-danger"
                          onClick={() => removeIncomeCategory(index)}
                          title="Delete"
                          style={{ padding: '0.25rem 0.5rem', fontSize: '0.875rem' }}
                        >
                          ✕
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                <tr className="tally-total">
                  <td>Total Income</td>
                  <td>{formatCurrency(totalIncome)}</td>
                  <td></td>
                  <td></td>
                </tr>
              </tbody>
            </table>
            <button className="app-btn-secondary" onClick={addIncomeCategory} style={{ width: '100%', marginTop: '0.5rem' }}>
              + Add Income
            </button>
          </div>

          <div className="tally-section">
            <h3>Expense</h3>
            <table className="tally-table">
              <thead>
                <tr>
                  <th>Category</th>
                  <th>Amount</th>
                  <th>Reason</th>
                  <th style={{ width: '50px' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {expenseTable.categories.map((category, index) => (
                  <tr key={category.key}>
                    <td>{category.label}</td>
                    <td>
                      <input
                        type="number"
                        className="tally-cell-input"
                        value={category.amount}
                        onChange={event => updateExpenseAmount(index, Number(event.target.value) || 0)}
                        readOnly={!category.editable}
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        className="tally-cell-input"
                        value={category.reason}
                        onChange={event => updateExpenseReason(index, event.target.value)}
                        readOnly={!category.editable}
                        placeholder="Reason..."
                      />
                    </td>
                    <td>
                      {category.editable && (
                        <button
                          className="app-btn-danger"
                          onClick={() => removeExpenseCategory(index)}
                          title="Delete"
                          style={{ padding: '0.25rem 0.5rem', fontSize: '0.875rem' }}
                        >
                          ✕
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                <tr className="tally-total">
                  <td>Total Expense</td>
                  <td>{formatCurrency(totalExpense)}</td>
                  <td></td>
                  <td></td>
                </tr>
              </tbody>
            </table>
            <button className="app-btn-secondary" onClick={addExpenseCategory} style={{ width: '100%', marginTop: '0.5rem' }}>
              + Add Expense
            </button>
          </div>
        </div>

        <div className="tally-section-footer">
          <p><strong>Net:</strong> {formatCurrency(totalIncome - totalExpense)}</p>
        </div>
      </div>
    </div>
  )
}