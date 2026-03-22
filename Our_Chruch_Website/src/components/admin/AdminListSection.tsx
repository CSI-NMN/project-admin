import { AdminRecord } from '@/types/admin'
import DeleteIcon from '@/components/common/DeleteIcon'
import EditIcon from '@/components/common/EditIcon'

interface AdminListSectionProps {
  admins: AdminRecord[]
  onCreateNew: () => void
  onEditRequest: (admin: AdminRecord) => void
  onRemoveRequest: (admin: AdminRecord) => void
}

export default function AdminListSection({
  admins,
  onCreateNew,
  onEditRequest,
  onRemoveRequest,
}: AdminListSectionProps) {
  return (
    <>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-title">Admins</h1>
          <p className="admin-subtitle">View and manage admins and their church access roles.</p>
        </div>

        <button className="app-btn-primary admin-add-outline-btn" onClick={onCreateNew} type="button">
          Add new admin
        </button>
      </div>

      <div className="app-card admin-table-card">
        <div className="admin-table-scroll">
          <table className="admin-table">
            <thead>
              <tr className="admin-table-head-row">
                <th className="admin-table-th">Member ID</th>
                <th className="admin-table-th">Name</th>
                <th className="admin-table-th">Admin role</th>
                <th className="admin-table-th">Email address</th>
                <th className="admin-table-th">Actions</th>
              </tr>
            </thead>
            <tbody>
              {admins.map((admin, index) => (
                <tr
                  key={admin.id}
                  className={`admin-table-row ${index % 2 === 0 ? 'admin-table-row-even' : 'admin-table-row-odd'}`}
                >
                  <td className="admin-table-td">{admin.memberId}</td>
                  <td className="admin-table-td admin-table-td-strong">{admin.name}</td>
                  <td className="admin-table-td">{admin.role}</td>
                  <td className="admin-table-td">{admin.email || 'N/A'}</td>
                  <td className="admin-table-td">
                    <button
                      onClick={() => onEditRequest(admin)}
                      className="admin-action-icon-btn"
                      type="button"
                      aria-label={`Edit ${admin.name}`}
                      title="Edit role"
                    >
                      <EditIcon />
                    </button>
                    <button
                      onClick={() => onRemoveRequest(admin)}
                      className="admin-action-icon-btn admin-action-icon-btn-delete"
                      type="button"
                      aria-label={`Remove ${admin.name}`}
                      title="Remove admin"
                    >
                      <DeleteIcon className="app-delete-icon-image admin-action-icon-image" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}
