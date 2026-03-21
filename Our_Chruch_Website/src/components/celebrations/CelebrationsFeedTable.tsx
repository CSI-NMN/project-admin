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
}

interface CelebrationsFeedTableProps {
  feedType: CelebrationFeedType
  monthLabel: string
  items: CelebrationFeedItem[]
}

export default function CelebrationsFeedTable({
  feedType,
  monthLabel,
  items,
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
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
