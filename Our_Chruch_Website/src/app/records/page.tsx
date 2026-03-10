'use client'

import { Suspense, useMemo, useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Family, Person } from '@/types/records'
import { useAppSelector } from '@/store/hooks'
import { buildSearchIndex, matchesRecordSearch } from '@/utils/records'

function AdminRecordsPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const families = useAppSelector(state => state.records.families)

  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<Person[]>([])
  const [selectedFamily, setSelectedFamily] = useState<Family | null>(null)
  const [showTable, setShowTable] = useState(false)
  const [showAddDialog, setShowAddDialog] = useState(false)

  const searchIndex = useMemo(() => buildSearchIndex(families), [families])

  useEffect(() => {
    const familyId = searchParams.get('familyId')
    if (!familyId) return

    const family = families.find(f => f.id === familyId)
    if (family) {
      setSelectedFamily(family)
      setShowTable(true)
    }
  }, [families, searchParams])

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value
    setSearchQuery(query)

    const normalizedQuery = query.trim().toLowerCase()
    const numericQuery = query.replace(/\D/g, '')

    if (normalizedQuery) {
      const results = searchIndex
        .filter(entry => matchesRecordSearch(entry, normalizedQuery, numericQuery))
        .map(entry => entry.person)

      setSearchResults(results)
      setSelectedFamily(null)
      setShowTable(false)
      return
    }

    setSearchResults([])
    setSelectedFamily(null)
    setShowTable(false)
  }

  const handleSelectRecord = (person: Person) => {
    const family = families.find(f => f.id === person.familyId)
    setSelectedFamily(family || null)
    setShowTable(true)
  }

  const handleCreateNewRecord = () => {
    router.push('/records/create')
  }

  const handleEditPerson = (personId: string) => {
    router.push(`/records/edit?id=${personId}`)
  }

  const handleEditHierarchy = () => {
    alert('Edit family hierarchy functionality to be implemented')
  }

  const handleAddNewUser = () => {
    setShowAddDialog(true)
  }

  const handleCreateNewFamily = () => {
    setShowAddDialog(false)
    router.push('/records/create')
  }

  const handleCreateNewPerson = () => {
    setShowAddDialog(false)
    if (selectedFamily?.id) {
      router.push(`/records/create?mode=person&familyId=${selectedFamily.id}`)
      return
    }
    router.push('/records/create?mode=person')
  }

  const handleBackToResults = () => {
    setShowTable(false)
    setSelectedFamily(null)
    router.push('/records')
  }

  return (
    <div className="app-page">
      <div className="app-shell">
        {!showTable ? (
          <>
            <div className="records-header">
              <div>
                <h1 className="records-title">Records</h1>
                <p className="records-subtitle">
                  View and manage records of all church family members
                </p>
              </div>
              <button onClick={handleCreateNewRecord} className="app-btn-primary">
                Create new Family
              </button>
            </div>

            <div className="app-card records-search-card">
              <h2 className="records-section-title">Find an existing record</h2>
              <p className="records-search-help">
                To view a record, search by member name, subscription ID, family ID, or phone number.
              </p>

              <div className="records-search-wrap">
                <div className="records-search-icon">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={handleSearch}
                  className="records-search-input"
                />
                {searchQuery && (
                  <button
                    onClick={() => {
                      setSearchQuery('')
                      setSearchResults([])
                      setSelectedFamily(null)
                      setShowTable(false)
                    }}
                    className="records-search-clear"
                  >
                    X
                  </button>
                )}
              </div>

              {searchQuery && searchResults.length > 0 && (
                <p className="records-search-status records-search-status-strong">
                  We found {searchResults.length} matching record{searchResults.length !== 1 ? 's' : ''}.
                </p>
              )}

              {searchQuery && searchResults.length === 0 && (
                <p className="records-search-status">
                  We found 0 matching records. Try searching for a different record.
                </p>
              )}
            </div>

            {searchResults.length > 0 && (
              <div className="records-result-list">
                {searchResults.map(person => (
                  <button
                    key={person.id}
                    onClick={() => handleSelectRecord(person)}
                    className="records-result-item"
                  >
                    <div>
                      <h3 className="records-result-name">
                        {person.first_name} {person.last_name}, {person.subscriptionCardNo}
                      </h3>
                      <p className="records-result-family">
                        Family: {families.find(f => f.id === person.familyId)?.family_name}
                      </p>
                    </div>
                    <svg className="records-result-chevron" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                ))}
              </div>
            )}
          </>
        ) : (
          <>
            <button onClick={handleBackToResults} className="app-back-link mb-6">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Results
            </button>

            {selectedFamily && (
              <div className="app-card records-family-shell">
                <div className="records-family-header">
                  <h3 className="records-section-title">Family Details</h3>
                  <div className="records-family-grid">
                    <div>
                      <p className="records-field-label">Family Code (Unique)</p>
                      <p className="records-field-value records-field-value-lg">{selectedFamily.family_code}</p>
                    </div>
                    <div>
                      <p className="records-field-label">Family Name</p>
                      <p className="records-field-value records-field-value-lg">{selectedFamily.family_name}</p>
                    </div>
                    <div>
                      <p className="records-field-label">Area</p>
                      <p className="records-field-value records-field-value-lg">{selectedFamily.area || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="records-field-label">Residential Address</p>
                      <p className="records-field-value">{selectedFamily.residential_address || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="records-field-label">Office Address</p>
                      <p className="records-field-value">{selectedFamily.office_address || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="records-field-label">Family Head Name</p>
                      <p className="records-field-value records-field-value-lg">
                        {selectedFamily.members.find(m => m.is_head)?.first_name}{' '}
                        {selectedFamily.members.find(m => m.is_head)?.last_name}
                      </p>
                    </div>
                    <div className="col-span-3">
                      <p className="records-field-label">Head Phone Number</p>
                      <p className="records-field-value records-field-value-lg">
                        {selectedFamily.members.find(m => m.is_head)?.mobile_no || 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="records-family-actions">
                  <button onClick={handleEditHierarchy} className="app-btn-primary">
                    Edit Family Hierarchy
                  </button>
                </div>

                <div className="records-table-scroll">
                  <table className="records-table">
                    <thead>
                      <tr className="records-table-head-row">
                        <th className="records-table-th">Name</th>
                        <th className="records-table-th">Subscription Card</th>
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
                          className={`records-table-row ${index % 2 === 0 ? 'records-table-row-even' : 'records-table-row-odd'}`}
                        >
                          <td className="records-table-td records-table-td-strong">
                            {person.first_name} {person.last_name}
                          </td>
                          <td className="records-table-td">{person.subscriptionCardNo}</td>
                          <td className="records-table-td">{person.relationship_type}</td>
                          <td className="records-table-td">{person.mobile_no}</td>
                          <td className="records-table-td">{person.email}</td>
                          <td className="records-table-td">
                            <button onClick={() => handleEditPerson(person.id)} className="records-action-link">
                              Edit
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="records-family-footer">
                  <button onClick={handleAddNewUser} className="records-footer-action">
                    Add new record
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {showAddDialog && (
        <div className="records-modal-overlay">
          <div className="records-modal">
            <div className="records-modal-header">
              <h3 className="records-modal-title">Add New Record</h3>
              <p className="records-modal-subtitle">Choose what you want to create.</p>
            </div>
            <div className="records-modal-body">
              <button onClick={handleCreateNewFamily} className="records-modal-option">
                New Family
              </button>
              <button onClick={handleCreateNewPerson} className="records-modal-option records-modal-option-active">
                New Person
              </button>
            </div>
            <div className="records-modal-footer">
              <button onClick={() => setShowAddDialog(false)} className="records-modal-cancel">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}



export default function AdminRecordsPage() {
  return (
    <Suspense
      fallback={
        <div className="app-page">
          <div className="app-shell">
            <p className="app-empty-text">Loading...</p>
          </div>
        </div>
      }
    >
      <AdminRecordsPageContent />
    </Suspense>
  )
}
