interface DeleteRecordModalProps {
  deleteCandidate: {
    id: string
    firstName: string
    lastName?: string
  } | null
  onCancel: () => void
  onConfirm: () => void
}

export default function DeleteRecordModal({
  deleteCandidate,
  onCancel,
  onConfirm,
}: DeleteRecordModalProps) {
  if (!deleteCandidate) return null

  return (
    <div className="records-modal-overlay">
      <div className="records-modal">
        <div className="records-modal-header">
          <h3 className="records-modal-title">Delete Record</h3>
          <p className="records-modal-subtitle">
            Are you sure you want to delete {deleteCandidate.firstName} {deleteCandidate.lastName}?
          </p>
        </div>
        <div className="records-modal-footer">
          <button onClick={onCancel} className="app-btn-secondary">
            Cancel
          </button>
          <button onClick={onConfirm} className="app-btn-primary">
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}
