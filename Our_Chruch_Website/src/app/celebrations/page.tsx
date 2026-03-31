'use client'

import './celebrations.css'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import * as XLSX from 'xlsx'
import { recordsService } from '@/store/api/recordsApi'
import { CelebrationFeedItem, CelebrationsDto, CelebrationFeedType } from '@/types/records'
import CelebrationsFeedTable from '@/components/celebrations/CelebrationsFeedTable'
import DeleteRecordModal from '@/components/records/DeleteRecordModal'
import { showErrorToast } from '@/components/common/toast'

const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]

const downloadCelebrationsWorkbook = (
  monthLabel: string,
  birthdayItems: CelebrationFeedItem[],
  anniversaryItems: CelebrationFeedItem[]
) => {
  const workbook = XLSX.utils.book_new()

  const birthdaysSheet = XLSX.utils.json_to_sheet(
    birthdayItems.map(item => ({
      Name: item.name,
      Family: `${item.familyName} (${item.familyCode})`,
      Date: item.eventDateLabel,
      Mobile: item.mobile || 'N/A',
      Email: item.email || 'N/A',
    }))
  )

  const anniversariesSheet = XLSX.utils.json_to_sheet(
    anniversaryItems.map(item => ({
      Name: item.name,
      Family: `${item.familyName} (${item.familyCode})`,
      Date: item.eventDateLabel,
      Mobile: item.mobile || 'N/A',
      Email: item.email || 'N/A',
    }))
  )

  XLSX.utils.book_append_sheet(workbook, birthdaysSheet, 'Birthdays')
  XLSX.utils.book_append_sheet(workbook, anniversariesSheet, 'Anniversaries')
  XLSX.writeFile(workbook, `celebrations-${monthLabel.toLowerCase()}.xlsx`)
}

const CELEBRATIONS_VIEW_STATE_KEY = 'celebrations-view-state'

const getInitialCelebrationsState = () => {
  if (typeof window === 'undefined') {
    return {
      month: new Date().getMonth() + 1,
      feed: 'birthdays' as CelebrationFeedType,
    }
  }

  const savedState = window.sessionStorage.getItem(CELEBRATIONS_VIEW_STATE_KEY)
  if (!savedState) {
    return {
      month: new Date().getMonth() + 1,
      feed: 'birthdays' as CelebrationFeedType,
    }
  }

  try {
    const parsed = JSON.parse(savedState) as {
      month?: number
      feed?: CelebrationFeedType
    }

    return {
      month:
        parsed.month && parsed.month >= 1 && parsed.month <= 12
          ? parsed.month
          : new Date().getMonth() + 1,
      feed: parsed.feed === 'anniversaries' ? 'anniversaries' : ('birthdays' as CelebrationFeedType),
    }
  } catch {
    return {
      month: new Date().getMonth() + 1,
      feed: 'birthdays' as CelebrationFeedType,
    }
  }
}

const persistCelebrationsState = (month: number, feed: CelebrationFeedType) => {
  if (typeof window === 'undefined') return

  window.sessionStorage.setItem(
    CELEBRATIONS_VIEW_STATE_KEY,
    JSON.stringify({
      month,
      feed,
    })
  )
}

export default function CelebrationsPage() {
  const router = useRouter()
  const [initialState] = useState(getInitialCelebrationsState)
  const [selectedMonth, setSelectedMonth] = useState<number>(initialState.month)
  const [activeFeed, setActiveFeed] = useState<CelebrationFeedType>(initialState.feed)
  const [deleteCandidate, setDeleteCandidate] = useState<{
    id: string
    familyId: string
    firstName: string
    lastName?: string
  } | null>(null)
  const [remoteCelebrations, setRemoteCelebrations] = useState<CelebrationsDto | null>(null)

  const loadCelebrations = (month: number) => {
    recordsService
      .getCelebrations(month)
      .then(payload => {
        setRemoteCelebrations(payload)
      })
      .catch(() => {
        setRemoteCelebrations(null)
      })
  }

  useEffect(() => {
    loadCelebrations(selectedMonth)
  }, [selectedMonth])

  const selectedMonthLabel = remoteCelebrations?.monthLabel || MONTHS[selectedMonth - 1]
  const birthdaysForView = remoteCelebrations?.birthdays || []
  const anniversariesForView = remoteCelebrations?.anniversaries || []
  const birthdaysCount = remoteCelebrations?.birthdaysCount ?? 0
  const anniversariesCount = remoteCelebrations?.anniversariesCount ?? 0
  const activeItems = activeFeed === 'birthdays' ? birthdaysForView : anniversariesForView

  const handleDownload = () => {
    downloadCelebrationsWorkbook(selectedMonthLabel, birthdaysForView, anniversariesForView)
  }

  const handleEditRecord = (personId: string, familyId: string) => {
    persistCelebrationsState(selectedMonth, activeFeed)
    router.push(`/records/edit?familyId=${familyId}&id=${personId}&source=celebrations`)
  }

  const handleDeleteRequest = (personId: string, familyId: string, displayName: string) => {
    const nameParts = displayName.split(' ').filter(Boolean)
    const firstName = nameParts[0] || 'Record'
    const lastName = nameParts.slice(1).join(' ')

    setDeleteCandidate({
      id: personId,
      familyId,
      firstName,
      lastName,
    })
  }

  const handleConfirmDelete = async () => {
    if (!deleteCandidate) return

    try {
      await recordsService.deleteFamilyMember(deleteCandidate.familyId, deleteCandidate.id)
      setDeleteCandidate(null)
      loadCelebrations(selectedMonth)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to delete person'
      showErrorToast(message)
    }
  }

  return (
    <div className="app-page">
      <div className="app-shell">
        <h1 className="celebrations-title">Celebrations</h1>
        <p className="celebrations-subtitle">
          View and manage monthly birthdays and anniversaries for church family members.
        </p>

        <div className="app-card celebrations-card">
          <div className="celebrations-filter">
            <label className="app-label">Select month</label>
            <select
              value={selectedMonth}
              onChange={event => {
                const nextMonth = Number(event.target.value)
                setSelectedMonth(nextMonth)
                persistCelebrationsState(nextMonth, activeFeed)
              }}
              className="app-input celebrations-month-select"
            >
              {MONTHS.map((monthName, index) => (
                <option key={monthName} value={index + 1}>
                  {monthName}
                </option>
              ))}
            </select>
          </div>

          <div className="celebrations-download-row">
            <button onClick={handleDownload} className="app-btn-primary" type="button">
              Download
            </button>
          </div>

          <div className="celebrations-summary">
            <p>
              Number of birthdays in {selectedMonthLabel}:{' '}
              <span className="celebrations-summary-value">{birthdaysCount}</span>
            </p>
            <p>
              Number of anniversaries in {selectedMonthLabel}:{' '}
              <span className="celebrations-summary-value">{anniversariesCount}</span>
            </p>
          </div>

          <div className="celebrations-tabs" role="tablist" aria-label="Celebrations feed tabs">
            <button
              className={`celebrations-tab ${activeFeed === 'birthdays' ? 'celebrations-tab-active' : ''}`}
              onClick={() => {
                setActiveFeed('birthdays')
                persistCelebrationsState(selectedMonth, 'birthdays')
              }}
              type="button"
            >
              Birthdays
            </button>
            <button
              className={`celebrations-tab ${activeFeed === 'anniversaries' ? 'celebrations-tab-active' : ''}`}
              onClick={() => {
                setActiveFeed('anniversaries')
                persistCelebrationsState(selectedMonth, 'anniversaries')
              }}
              type="button"
            >
              Anniversaries
            </button>
          </div>

          <CelebrationsFeedTable
            feedType={activeFeed}
            monthLabel={selectedMonthLabel}
            items={activeItems}
            onEditRecord={handleEditRecord}
            onDeleteRecord={handleDeleteRequest}
          />
        </div>
      </div>

      <DeleteRecordModal
        deleteCandidate={deleteCandidate}
        onCancel={() => setDeleteCandidate(null)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  )
}
