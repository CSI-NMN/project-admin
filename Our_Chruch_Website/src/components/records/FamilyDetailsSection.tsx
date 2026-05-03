import { Family, Person } from '@/types/records'
import DeleteIcon from '@/components/common/DeleteIcon'
import EditIcon from '@/components/common/EditIcon'

interface FamilyDetailsSectionProps {
  selectedFamily: Family
  showHierarchyEditor: boolean
  selectedHierarchyPeople: Person[]
  selectedHierarchyPersonIds: number[]
  onBackToRecords: () => void
  onEditFamily: () => void
  onEditHierarchy: () => void
  onDiscardHierarchy: () => void
  onOpenSplitModal: () => void
  onSelectHierarchyPerson: (personId: number) => void
  onEditPerson: (personId: number) => void
  onDeleteRequest: (person: Person) => void
  onAddNewRecord: () => void
}

export default function FamilyDetailsSection({
  selectedFamily,
  showHierarchyEditor,
  selectedHierarchyPeople,
  selectedHierarchyPersonIds,
  onBackToRecords,
  onEditFamily,
  onEditHierarchy,
  onDiscardHierarchy,
  onOpenSplitModal,
  onSelectHierarchyPerson,
  onEditPerson,
  onDeleteRequest,
  onAddNewRecord,
}: FamilyDetailsSectionProps) {
  return (
    <>
      <button onClick={onBackToRecords} className="app-back-link mb-6">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Records
      </button>

      <div className="app-card records-family-shell">
        <div className="records-family-header">
          <div className="records-family-title-row">
            <h3 className="records-section-title">Family Details</h3>
            <button
              onClick={onEditFamily}
              className="records-family-edit-icon-btn"
              aria-label="Edit Family Details"
              title="Edit Family Details"
            >
              <EditIcon />
            </button>
          </div>
          <div className="records-family-grid">
            <div>
              <p className="records-field-label">Family Code</p>
              <p className="records-field-value records-field-value-lg">{selectedFamily.familyCode}</p>
            </div>
            <div>
              <p className="records-field-label">Family Name</p>
              <p className="records-field-value records-field-value-lg">{selectedFamily.familyName}</p>
            </div>
            <div>
              <p className="records-field-label">House Number, Street Name</p>
              <p className="records-field-value">{selectedFamily.address1 || 'N/A'}</p>
            </div>
            <div>
              <p className="records-field-label">Area</p>
              <p className="records-field-value records-field-value-lg">{selectedFamily.area || 'N/A'}</p>
            </div>
            <div>
              <p className="records-field-label">Landmark</p>
              <p className="records-field-value">{selectedFamily.address2 || 'N/A'}</p>
            </div>
            <div>
              <p className="records-field-label">Pincode</p>
              <p className="records-field-value">{selectedFamily.pincode || 'N/A'}</p>
            </div>
            <div>
              <p className="records-field-label">City</p>
              <p className="records-field-value records-field-value-lg">
                {selectedFamily.city || 'N/A'}
              </p>
            </div>
            <div>
              <p className="records-field-label">State</p>
              <p className="records-field-value">{selectedFamily.state || 'N/A'}</p>
            </div>
            <div>
              <p className="records-field-label">Family Head Name</p>
              <p className="records-field-value records-field-value-lg">
                {selectedFamily.members.find(m => m.isHead)?.firstName}{' '}
                {selectedFamily.members.find(m => m.isHead)?.lastName}
              </p>
            </div>
            <div className="col-span-3">
              <p className="records-field-label">Head Phone Number</p>
              <p className="records-field-value records-field-value-lg">
                {selectedFamily.members.find(m => m.isHead)?.mobileNo || 'N/A'}
              </p>
            </div>
          </div>
        </div>

        {!showHierarchyEditor && (
          <div className="records-family-actions">
            <button onClick={onEditHierarchy} className="app-btn-primary">
              Edit Family Hierarchy
            </button>
          </div>
        )}

        {showHierarchyEditor && (
          <div className="records-hierarchy-panel">
            <h4 className="records-hierarchy-title">Family Hierarchy Editor</h4>
            <p className="records-hierarchy-help">
              Select a person in the records table below, then move them to another family or create
              a new family.
            </p>

            <div className="records-hierarchy-selected">
              <p className="records-hierarchy-name">Selected records: {selectedHierarchyPeople.length}</p>
              {selectedHierarchyPeople.length > 0 && (
                <p className="records-hierarchy-sub">
                  {selectedHierarchyPeople
                    .map(person => `${person.firstName} ${person.lastName}`)
                    .join(', ')}
                </p>
              )}
            </div>

            <div className="records-hierarchy-top-actions">
              <button onClick={onDiscardHierarchy} className="app-back-link">
                Discard
              </button>
              <button
                onClick={onOpenSplitModal}
                className="app-btn-primary"
                disabled={selectedHierarchyPersonIds.length === 0}
              >
                Split Family
              </button>
            </div>
          </div>
        )}

        <div className="records-table-scroll">
          <table className="records-table">
            <thead>
              <tr className="records-table-head-row">
                <th className="records-table-th">Name</th>
                <th className="records-table-th">Subscription</th>
                <th className="records-table-th">Relationship</th>
                <th className="records-table-th">Mobile</th>
                <th className="records-table-th">Email</th>
                <th className="records-table-th">Actions</th>
              </tr>
            </thead>
            <tbody>
              {selectedFamily.members.map((person, index) => (
                <tr
                  key={person.id}
                  className={`records-table-row ${
                    index % 2 === 0 ? 'records-table-row-even' : 'records-table-row-odd'
                  }`}
                >
                  <td className="records-table-td records-table-td-strong">
                    {person.firstName} {person.lastName}
                  </td>
                  <td className="records-table-td">{person.membershipName || person.memberNo || 'N/A'}</td>
                  <td className="records-table-td">{person.relationshipType}</td>
                  <td className="records-table-td">{person.mobileNo}</td>
                  <td className="records-table-td">{person.email}</td>
                  <td className="records-table-td">
                    {showHierarchyEditor ? (
                      <button
                        onClick={() => onSelectHierarchyPerson(person.id)}
                        className={`records-select-btn ${
                          selectedHierarchyPersonIds.includes(person.id)
                            ? 'records-select-btn-active'
                            : ''
                        }`}
                      >
                        {selectedHierarchyPersonIds.includes(person.id) ? 'Selected' : 'Select'}
                      </button>
                    ) : (
                      <div className="records-action-group">
                        <button
                          onClick={() => onEditPerson(person.id)}
                          className="records-action-icon-btn"
                          aria-label={`Edit ${person.firstName} ${person.lastName}`}
                          title="Edit"
                        >
                          <EditIcon />
                        </button>
                        <button
                          onClick={() => onDeleteRequest(person)}
                          className="records-action-icon-btn records-action-icon-btn-delete"
                          aria-label={`Delete ${person.firstName} ${person.lastName}`}
                          title="Delete"
                        >
                          <DeleteIcon />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="records-family-footer">
          {!showHierarchyEditor && (
            <button onClick={onAddNewRecord} className="records-footer-action">
              Add new record
            </button>
          )}
        </div>
      </div>
    </>
  )
}

