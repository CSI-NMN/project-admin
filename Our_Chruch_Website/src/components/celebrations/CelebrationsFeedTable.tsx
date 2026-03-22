export type CelebrationFeedType = 'birthdays' | 'anniversaries'

export interface CelebrationFeedItem {
  id: string
  name: string
  familyName: string
  familyCode: string
  eventDateLabel: string
  eventDay: number
  mobile: string
  email: string
  actionPersonId: string
}

interface CelebrationsFeedTableProps {
  feedType: CelebrationFeedType
  monthLabel: string
  items: CelebrationFeedItem[]
  onEditRecord: (personId: string) => void
  onDeleteRecord: (personId: string) => void
}

export default function CelebrationsFeedTable({
  feedType,
  monthLabel,
  items,
  onEditRecord,
  onDeleteRecord,
}: CelebrationsFeedTableProps) {
  if (items.length === 0) {
    return (
      <p className="celebrations-empty">
        There are no {feedType === 'birthdays' ? 'birthdays' : 'anniversaries'} in {monthLabel}.
      </p>
    )
  }

  return (
    <div className="celebrations-table-scroll">
      <table className="celebrations-table">
        <thead>
          <tr className="celebrations-table-head-row">
            <th className="celebrations-table-th">Name</th>
            <th className="celebrations-table-th">Family</th>
            <th className="celebrations-table-th">Date</th>
            <th className="celebrations-table-th">Mobile</th>
            <th className="celebrations-table-th">Email</th>
            <th className="celebrations-table-th">Actions</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, index) => (
            <tr
              key={item.id}
              className={`celebrations-table-row ${
                index % 2 === 0 ? 'celebrations-table-row-even' : 'celebrations-table-row-odd'
              }`}
            >
              <td className="celebrations-table-td celebrations-table-td-strong">{item.name}</td>
              <td className="celebrations-table-td">
                {item.familyName} ({item.familyCode})
              </td>
              <td className="celebrations-table-td">{item.eventDateLabel}</td>
              <td className="celebrations-table-td">{item.mobile || 'N/A'}</td>
              <td className="celebrations-table-td">{item.email || 'N/A'}</td>
              <td className="celebrations-table-td">
                <div className="celebrations-action-group">
                  <button
                    onClick={() => onEditRecord(item.actionPersonId)}
                    className="celebrations-action-icon-btn"
                    aria-label={`Edit ${item.name}`}
                    title="Edit"
                    type="button"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M16.862 4.487a2.125 2.125 0 013.005 3.004L8.25 19.11l-4.125.938.937-4.125L16.862 4.487z"
                      />
                    </svg>
                  </button>
                  <button
                    onClick={() => onDeleteRecord(item.actionPersonId)}
                    className="celebrations-action-icon-btn celebrations-action-icon-btn-delete"
                    aria-label={`Delete ${item.name}`}
                    title="Delete"
                    type="button"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3 6h18M9 6V4h6v2m-8 0l1 14h8l1-14"
                      />
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
