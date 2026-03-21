'use client'

import './celebrations.css'
import { useMemo, useState } from 'react'
import { useAppSelector } from '@/store/hooks'
import CelebrationsFeedTable, {
  CelebrationFeedItem,
  CelebrationFeedType,
} from '@/components/celebrations/CelebrationsFeedTable'

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
})

export default function CelebrationsPage() {
  const families = useAppSelector(state => state.records.families)
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1)
  const [activeFeed, setActiveFeed] = useState<CelebrationFeedType>('birthdays')

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
      family.members.forEach(person => {
        const parts = getMonthAndDay(person.date_of_marriage)
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
            'anniversary'
          )
        )
      })
    })

    return items.sort((a, b) => a.eventDay - b.eventDay || a.name.localeCompare(b.name))
  }, [families, selectedMonth])

  const selectedMonthLabel = MONTHS[selectedMonth - 1]
  const activeItems = activeFeed === 'birthdays' ? birthdayItems : anniversaryItems

  return (
    <div className="app-page">
      <div className="app-shell">
        <h1 className="celebrations-title">Celebrations</h1>

        <div className="app-card celebrations-card">
          <div className="celebrations-filter">
            <label className="app-label">Select month</label>
            <select
              value={selectedMonth}
              onChange={event => setSelectedMonth(Number(event.target.value))}
              className="app-input celebrations-month-select"
            >
              {MONTHS.map((monthName, index) => (
                <option key={monthName} value={index + 1}>
                  {monthName}
                </option>
              ))}
            </select>
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
              onClick={() => setActiveFeed('birthdays')}
              type="button"
            >
              Birthdays
            </button>
            <button
              className={`celebrations-tab ${activeFeed === 'anniversaries' ? 'celebrations-tab-active' : ''}`}
              onClick={() => setActiveFeed('anniversaries')}
              type="button"
            >
              Anniversaries
            </button>
          </div>

          <CelebrationsFeedTable
            feedType={activeFeed}
            monthLabel={selectedMonthLabel}
            items={activeItems}
          />
        </div>
      </div>
    </div>
  )
}
