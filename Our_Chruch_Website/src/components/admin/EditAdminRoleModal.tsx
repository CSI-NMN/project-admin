import { AdminRecord, AdminRole } from '@/types/admin'

interface RoleOption {
  value: AdminRole
  description: string
}

interface EditAdminRoleModalProps {
  admin: AdminRecord | null
  selectedRole: AdminRole | ''
  roleOptions: RoleOption[]
  onRoleSelect: (role: AdminRole) => void
  onCancel: () => void
  onConfirm: () => void
}

export default function EditAdminRoleModal({
  admin,
  selectedRole,
  roleOptions,
  onRoleSelect,
  onCancel,
  onConfirm,
}: EditAdminRoleModalProps) {
  if (!admin) return null

  return (
    <div className="records-modal-overlay">
      <div className="records-modal admin-modal">
        <div className="records-modal-header">
          <h3 className="records-modal-title">Edit admin role</h3>
          <p className="records-modal-subtitle">Change the role for {admin.name}.</p>
        </div>

        <div className="admin-role-modal-body">
          {roleOptions.map(role => (
            <button
              key={role.value}
              type="button"
              onClick={() => onRoleSelect(role.value)}
              className={`admin-role-card ${selectedRole === role.value ? 'admin-role-card-active' : ''}`}
            >
              <span className="admin-role-radio" aria-hidden="true" />
              <div>
                <p className="admin-role-title">{role.value}</p>
                <p className="admin-role-description">{role.description}</p>
              </div>
            </button>
          ))}
        </div>

        <div className="records-modal-footer">
          <button onClick={onCancel} className="app-btn-secondary" type="button">
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="app-btn-primary"
            type="button"
            disabled={!selectedRole}
          >
            Save role
          </button>
        </div>
      </div>
    </div>
  )
}
