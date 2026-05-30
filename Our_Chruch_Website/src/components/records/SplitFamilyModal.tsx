import { Family } from '@/types/records'

export type SplitModalMode = 'choose' | 'merge'

interface SplitFamilyModalProps {
  show: boolean
  mode: SplitModalMode
  familySearchQuery: string
  filteredTargetFamilies: Family[]
  targetFamilyId: number | null
  canMerge: boolean
  onClose: () => void
  onCreateNewFamily: () => void
  onModeChange: (mode: SplitModalMode) => void
  onFamilySearchChange: (query: string) => void
  onTargetFamilySelect: (familyId: number) => void
  onMerge: () => void
}

export default function SplitFamilyModal({
  show,
  mode,
  familySearchQuery,
  filteredTargetFamilies,
  targetFamilyId,
  canMerge,
  onClose,
  onCreateNewFamily,
  onModeChange,
  onFamilySearchChange,
  onTargetFamilySelect,
  onMerge,
}: SplitFamilyModalProps) {
  if (!show) return null

  return (
    <div className="records-modal-overlay">
      <div className="records-modal records-split-modal">
        <div className="records-modal-header">
          <h3 className="records-modal-title">Split Family</h3>
          <p className="records-modal-subtitle">
            {mode === 'choose'
              ? 'Choose how to move the selected records.'
              : 'Search a family record and merge selected members into it.'}
          </p>
        </div>

        <div className="records-modal-body">
          {mode === 'choose' ? (
            <>
              <button onClick={onCreateNewFamily} className="records-modal-option">
                Create New Family
              </button>
              <button
                onClick={() => onModeChange('merge')}
                className="records-modal-option records-modal-option-active"
              >
                Merge to Different Family
              </button>
            </>
          ) : (
            <>
              <input
                type="text"
                placeholder="Search family by name or code"
                value={familySearchQuery}
                onChange={event => onFamilySearchChange(event.target.value)}
                className="app-input records-split-family-search"
              />

              <div className="records-split-family-list">
                {filteredTargetFamilies.length > 0 ? (
                  filteredTargetFamilies.map(family => (
                    <button
                      key={family.id}
                      onClick={() => onTargetFamilySelect(family.id)}
                      className={`records-split-family-item ${
                        targetFamilyId === family.id ? 'records-split-family-item-active' : ''
                      }`}
                    >
                      <span>{family.familyName}</span>
                      <span className="records-split-family-code">{family.familyCode}</span>
                    </button>
                  ))
                ) : (
                  <p className="records-split-family-empty">No family found for this search.</p>
                )}
              </div>
            </>
          )}
        </div>

        <div className="records-modal-footer">
          {mode === 'merge' && (
            <button onClick={() => onModeChange('choose')} className="app-btn-secondary">
              Back
            </button>
          )}
          <button onClick={onClose} className="app-btn-secondary">
            Cancel
          </button>
          {mode === 'merge' && (
            <button onClick={onMerge} className="app-btn-primary" disabled={!canMerge}>
              Merge Family
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

