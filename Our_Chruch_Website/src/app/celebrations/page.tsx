'use client'

import './celebrations.css'
import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import * as XLSX from 'xlsx'
import { useAppSelector } from '@/store/hooks'
import { useAppDispatch } from '@/store/hooks'
import { deletePerson } from '@/store/slices/recordsSlice'
import { Person } from '@/types/records'
import CelebrationsFeedTable, {
  CelebrationFeedItem,
  CelebrationFeedType,
} from '@/components/celebrations/CelebrationsFeedTable'
import DeleteRecordModal from '@/components/records/DeleteRecordModal'

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

const getMonthAndDay = (value?: string) => {
  if (!value) return null

  const isoMatch = /^(\d{4})-(\d{2})-(\d{2})/.exec(value)
  if (isoMatch) {
    return {
      month: Number(isoMatch[2]),
      day: Number(isoMatch[3]),
    }
  }

  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return null

  return {
    month: parsed.getMonth() + 1,
    day: parsed.getDate(),
  }
}

const buildCelebrationItem = (
  personId: string,
  name: string,
  familyName: string,
  familyCode: string,
  day: number,
  month: number,
  mobile: string | undefined,
  email: string | undefined,
  suffix: string
): CelebrationFeedItem => ({
  id: `${personId}-${suffix}`,
  name,
  familyName,
  familyCode,
  eventDateLabel: `${String(day).padStart(2, '0')} ${MONTHS[month - 1]}`,
  eventDay: day,
  mobile: mobile || '',
  email: email || '',
  actionPersonId: personId,
})

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

const buildHonorificName = (person: Person) => {
  const displayName = person.first_name.trim() || `${person.first_name} ${person.last_name}`.trim()
  if (person.gender?.toLowerCase() === 'male') return `Mr ${displayName}`
  if (person.gender?.toLowerCase() === 'female') return `Mrs ${displayName}`
  return displayName
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
  const dispatch = useAppDispatch()
  const families = useAppSelector(state => state.records.families)
  const [initialState] = useState(getInitialCelebrationsState)
  const [selectedMonth, setSelectedMonth] = useState<number>(initialState.month)
  const [activeFeed, setActiveFeed] = useState<CelebrationFeedType>(initialState.feed)
  const [deleteCandidate, setDeleteCandidate] = useState<Person | null>(null)

  const birthdayItems = useMemo(() => {
    const items: CelebrationFeedItem[] = []

    families.forEach(family => {
      family.members.forEach(person => {
        const parts = getMonthAndDay(person.date_of_birth)
        if (!parts || parts.month !== selectedMonth) return

        items.push(
          buildCelebrationItem(
            person.id,
            `${person.first_name} ${person.last_name}`,
            family.family_name,
            family.family_code,
            parts.day,
            parts.month,
            person.mobile_no,
            person.email,
            'birthday'
          )
        )
      })
    })

    return items.sort((a, b) => a.eventDay - b.eventDay || a.name.localeCompare(b.name))
  }, [families, selectedMonth])

  const anniversaryItems = useMemo(() => {
    const items: CelebrationFeedItem[] = []

    families.forEach(family => {
      const groupedByMarriageDate = family.members.reduce<Record<string, Person[]>>((acc, person) => {
        if (!person.date_of_marriage) return acc
        const parts = getMonthAndDay(person.date_of_marriage)
        if (!parts || parts.month !== selectedMonth) return acc

        const key = `${parts.month}-${parts.day}-${person.date_of_marriage}`
        acc[key] = [...(acc[key] || []), person]
        return acc
      }, {})

      Object.values(groupedByMarriageDate).forEach(group => {
        const sortedGroup = [...group].sort((a, b) => {
          if (a.is_head !== b.is_head) return a.is_head ? -1 : 1
          if (a.relationship_type === 'Spouse' && b.relationship_type !== 'Spouse') return 1
          if (b.relationship_type === 'Spouse' && a.relationship_type !== 'Spouse') return -1
          return `${a.first_name} ${a.last_name}`.localeCompare(`${b.first_name} ${b.last_name}`)
        })

        const primaryPerson = sortedGroup[0]
        const parts = getMonthAndDay(primaryPerson.date_of_marriage)
        if (!parts) return

        const displayName =
          sortedGroup.length > 1
            ? sortedGroup.slice(0, 2).map(buildHonorificName).join(' & ')
            : buildHonorificName(primaryPerson)

        items.push(
          buildCelebrationItem(
            primaryPerson.id,
            displayName,
            family.family_name,
            family.family_code,
            parts.day,
            parts.month,
            primaryPerson.mobile_no,
            primaryPerson.email,
            'anniversary'
          )
        )
      })
    })

    return items.sort((a, b) => a.eventDay - b.eventDay || a.name.localeCompare(b.name))
  }, [families, selectedMonth])

  const selectedMonthLabel = MONTHS[selectedMonth - 1]
  const activeItems = activeFeed === 'birthdays' ? birthdayItems : anniversaryItems
  const peopleById = useMemo(() => {
    const personMap = new Map<string, Person>()
    families.forEach(family => {
      family.members.forEach(person => {
        personMap.set(person.id, person)
      })
    })
    return personMap
  }, [families])

  const handleDownload = () => {
    downloadCelebrationsWorkbook(selectedMonthLabel, birthdayItems, anniversaryItems)
  }

  const handleEditRecord = (personId: string) => {
    persistCelebrationsState(selectedMonth, activeFeed)
    router.push(`/records/edit?id=${personId}&source=celebrations`)
  }

  const handleDeleteRequest = (personId: string) => {
    const person = peopleById.get(personId)
    if (!person) return
    setDeleteCandidate(person)
  }

  const handleConfirmDelete = () => {
    if (!deleteCandidate) return
    dispatch(deletePerson({ personId: deleteCandidate.id }))
    setDeleteCandidate(null)
  }

  return (
    <div className="app-page">
      <div className="app-shell">
        <h1 className="celebrations-title">Celebrations</h1>

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
              <span className="celebrations-summary-value">{birthdayItems.length}</span>
            </p>
            <p>
              Number of anniversaries in {selectedMonthLabel}:{' '}
              <span className="celebrations-summary-value">{anniversaryItems.length}</span>
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
