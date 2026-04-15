import DeleteIcon from '@/components/common/DeleteIcon'
import EditIcon from '@/components/common/EditIcon'
import { CelebrationFeedItem, CelebrationFeedType } from '@/types/records'

interface CelebrationsFeedTableProps {
  feedType: CelebrationFeedType
  monthLabel: string
  items: CelebrationFeedItem[]
  onEditRecord: (personId: number, familyId: number) => void
  onDeleteRecord: (personId: number, familyId: number, displayName: string) => void
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
                    onClick={() => onEditRecord(item.actionPersonId, item.actionFamilyId)}
                    className="celebrations-action-icon-btn"
                    aria-label={`Edit ${item.name}`}
                    title="Edit"
                    type="button"
                  >
                    <EditIcon />
                  </button>
                  <button
                    onClick={() => onDeleteRecord(item.actionPersonId, item.actionFamilyId, item.name)}
                    className="celebrations-action-icon-btn celebrations-action-icon-btn-delete"
                    aria-label={`Delete ${item.name}`}
                    title="Delete"
                    type="button"
                  >
                    <DeleteIcon />
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
