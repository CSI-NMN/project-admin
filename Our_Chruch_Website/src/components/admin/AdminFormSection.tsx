import { AdminRole } from '@/types/admin'
import { Person } from '@/types/records'

interface RoleOption {
  value: AdminRole
  description: string
}

interface AdminFormSectionProps {
  searchQuery: string
  candidateResults: Person[]
  selectedPerson: Person | null
  selectedRole: AdminRole | ''
  roleOptions: RoleOption[]
  onBack: () => void
  onSearchChange: (value: string) => void
  onSelectPerson: (person: Person) => void
  onClearPerson: () => void
  onRoleSelect: (role: AdminRole) => void
  onSubmit: () => void
}

export default function AdminFormSection({
  searchQuery,
  candidateResults,
  selectedPerson,
  selectedRole,
  roleOptions,
  onBack,
  onSearchChange,
  onSelectPerson,
  onClearPerson,
  onRoleSelect,
  onSubmit,
}: AdminFormSectionProps) {
  return (
    <>
      <button onClick={onBack} className="app-back-link mb-6" type="button">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Admins
      </button>

      <div className="app-card admin-card">
        <h1 className="admin-title">Add new admin</h1>
        <p className="admin-subtitle">Grant a church member an admin role within Our Church.</p>

        <section className="admin-section">
          <h2 className="admin-section-title">Who to appoint as admin?</h2>
          {!selectedPerson ? (
            <>
              <label className="app-label">Member search</label>
              <input
                value={searchQuery}
                onChange={event => onSearchChange(event.target.value)}
                className="app-input admin-search-input"
                placeholder="Search by name, subscription ID, phone number, or email"
              />

              {searchQuery.trim() && (
                <div className="admin-search-results">
                  {candidateResults.length > 0 ? (
                    candidateResults.map(person => (
                      <button
                        key={person.id}
                        onClick={() => onSelectPerson(person)}
                        type="button"
                        className="admin-search-result-card"
                      >
                        <span className="admin-search-result-name">
                          {person.firstName} {person.lastName}
                        </span>
                        <span className="admin-search-result-meta">
                          {person.memberNo} | {person.mobileNo || 'No mobile'} |{' '}
                          {person.email || 'No email'}
                        </span>
                      </button>
                    ))
                  ) : (
                    <p className="admin-empty-text">No matching members found.</p>
                  )}
                </div>
              )}
            </>
          ) : (
            <div className="admin-selected-person">
              <div className="admin-selected-grid">
                <div>
                  <p className="admin-field-label">Member ID</p>
                  <p className="admin-field-value">{selectedPerson.memberNo}</p>
                </div>
                <div>
                  <p className="admin-field-label">Name</p>
                  <p className="admin-field-value">
                    {selectedPerson.firstName} {selectedPerson.lastName}
                  </p>
                </div>
                <div>
                  <p className="admin-field-label">Email address</p>
                  <p className="admin-field-value">{selectedPerson.email || 'N/A'}</p>
                </div>
              </div>
              <button onClick={onClearPerson} className="app-btn-secondary" type="button">
                Appoint someone else
              </button>
            </div>
          )}
        </section>

        <section className="admin-section">
          <h2 className="admin-section-title">What kind of admin will they be?</h2>
          <div className="admin-role-list">
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
        </section>

        <div className="admin-form-actions">
          <button onClick={onBack} className="app-back-link" type="button">
            Go back
          </button>
          <button
            onClick={onSubmit}
            className="app-btn-primary"
            type="button"
            disabled={!selectedPerson || !selectedRole}
          >
            Add new admin
          </button>
        </div>
      </div>
    </>
  )
}

