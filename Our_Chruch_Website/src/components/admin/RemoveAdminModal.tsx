import { AdminRecord } from '@/types/admin'

interface RemoveAdminModalProps {
  admin: AdminRecord | null
  onCancel: () => void
  onConfirm: () => void
}

export default function RemoveAdminModal({
  admin,
  onCancel,
  onConfirm,
}: RemoveAdminModalProps) {
  if (!admin) return null

  return (
    <div className="records-modal-overlay">
      <div className="records-modal admin-modal">
        <div className="records-modal-header">
          <h3 className="records-modal-title">Remove admin</h3>
          <p className="records-modal-subtitle">
            Are you sure you want to remove {admin.name} from the {admin.role} role?
          </p>
        </div>
        <div className="records-modal-footer">
          <button onClick={onCancel} className="app-btn-secondary" type="button">
            Cancel
          </button>
          <button onClick={onConfirm} className="app-btn-primary" type="button">
            Remove
          </button>
        </div>
      </div>
    </div>
  )
}
