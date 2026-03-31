import { AdminRole } from '@/types/admin'
import { Person } from '@/types/records'

interface ConfirmAdminModalProps {
  show: boolean
  person: Person | null
  role: AdminRole | ''
  onCancel: () => void
  onConfirm: () => void
}

export default function ConfirmAdminModal({
  show,
  person,
  role,
  onCancel,
  onConfirm,
}: ConfirmAdminModalProps) {
  if (!show || !person || !role) return null

  return (
    <div className="records-modal-overlay">
      <div className="records-modal admin-modal">
        <div className="records-modal-header">
          <h3 className="records-modal-title">Add admin</h3>
          <p className="records-modal-subtitle">
            {person.first_name} {person.last_name} will be granted the role of {role}.
          </p>
        </div>
        <div className="records-modal-footer">
          <button onClick={onCancel} className="app-btn-secondary" type="button">
            Cancel
          </button>
          <button onClick={onConfirm} className="app-btn-primary" type="button">
            Add admin
          </button>
        </div>
      </div>
    </div>
  )
}
