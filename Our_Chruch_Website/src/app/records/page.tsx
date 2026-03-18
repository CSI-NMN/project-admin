'use client'

import './records.css'
import { Suspense, useMemo, useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Family, Person } from '@/types/records'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { deletePerson, updatePerson } from '@/store/slices/recordsSlice'
import { buildSearchIndex, matchesRecordSearch } from '@/utils/records'

function AdminRecordsPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const dispatch = useAppDispatch()
  const families = useAppSelector(state => state.records.families)

  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<Person[]>([])
  const [selectedFamily, setSelectedFamily] = useState<Family | null>(null)
  const [showTable, setShowTable] = useState(false)
  const [showHierarchyEditor, setShowHierarchyEditor] = useState(false)
  const [selectedHierarchyPersonIds, setSelectedHierarchyPersonIds] = useState<string[]>([])
  const [targetFamilyId, setTargetFamilyId] = useState('')
  const [showSplitModal, setShowSplitModal] = useState(false)
  const [splitModalMode, setSplitModalMode] = useState<'choose' | 'merge'>('choose')
  const [familySearchQuery, setFamilySearchQuery] = useState('')
  const [deleteCandidate, setDeleteCandidate] = useState<Person | null>(null)

  const searchIndex = useMemo(() => buildSearchIndex(families), [families])
  const availableFamilies = useMemo(
    () => families.filter(family => family.id !== selectedFamily?.id),
    [families, selectedFamily?.id]
  )

  const selectedHierarchyPeople = useMemo(() => {
    if (!selectedFamily || selectedHierarchyPersonIds.length === 0) return []
    return selectedFamily.members.filter(person => selectedHierarchyPersonIds.includes(person.id))
  }, [selectedFamily, selectedHierarchyPersonIds])
  const filteredTargetFamilies = useMemo(() => {
    const query = familySearchQuery.trim().toLowerCase()
    if (!query) return availableFamilies

    return availableFamilies.filter(
      family =>
        family.family_name.toLowerCase().includes(query) ||
        family.family_code.toLowerCase().includes(query) ||
        family.id.toLowerCase().includes(query)
    )
  }, [availableFamilies, familySearchQuery])
  const selectedFamilyId = selectedFamily?.id || ''

  useEffect(() => {
    const familyId = searchParams.get('familyId')
    if (!familyId) return

    const family = families.find(f => f.id === familyId)
    if (family) {
      setSelectedFamily(family)
      setShowTable(true)
    }
  }, [families, searchParams])

  useEffect(() => {
    if (!selectedFamilyId) return

    const refreshedFamily = families.find(f => f.id === selectedFamilyId) || null
    setSelectedFamily(refreshedFamily)
  }, [families, selectedFamilyId])

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

  const handleEditFamily = () => {
    if (!selectedFamily?.id) return
    router.push(`/records/family-edit?familyId=${selectedFamily.id}`)
  }

  const closeSplitModal = () => {
    setShowSplitModal(false)
    setSplitModalMode('choose')
    setFamilySearchQuery('')
    setTargetFamilyId('')
  }

  const resetHierarchyState = () => {
    setSelectedHierarchyPersonIds([])
    closeSplitModal()
  }

  const handleEditHierarchy = () => {
    if (showHierarchyEditor) {
      setShowHierarchyEditor(false)
      resetHierarchyState()
      return
    }

    setShowHierarchyEditor(true)
    resetHierarchyState()
  }

  const handleDiscardHierarchy = () => {
    setShowHierarchyEditor(false)
    resetHierarchyState()
  }

  const handleAddNewUser = () => {
    if (selectedFamily?.id) {
      router.push(`/records/create?mode=person&familyId=${selectedFamily.id}`)
      return
    }
    router.push('/records/create?mode=person')
  }

  const handleCreateNewFamilyFromHierarchy = () => {
    if (selectedHierarchyPersonIds.length === 0) {
      alert('Select at least one person first from the records table.')
      return
    }

    closeSplitModal()
    const movePersonIds = encodeURIComponent(selectedHierarchyPersonIds.join(','))
    router.push(`/records/create?movePersonIds=${movePersonIds}`)
  }

  const handleMoveToDifferentFamily = () => {
    if (selectedHierarchyPersonIds.length === 0 || !targetFamilyId) {
      alert('Select one or more people and a target family.')
      return
    }

    selectedHierarchyPersonIds.forEach(personId => {
      dispatch(
        updatePerson({
          personId,
          data: { familyId: targetFamilyId },
        })
      )
    })

    setShowHierarchyEditor(false)
    resetHierarchyState()
    router.push(`/records?familyId=${targetFamilyId}`)
  }

  const handleOpenSplitModal = () => {
    if (selectedHierarchyPersonIds.length === 0) return
    setShowSplitModal(true)
    setSplitModalMode('choose')
    setFamilySearchQuery('')
    setTargetFamilyId('')
  }

  const handleBackToResults = () => {
    setShowTable(false)
    setSelectedFamily(null)
    setShowHierarchyEditor(false)
    resetHierarchyState()
    router.push('/records')
  }

  const handleSelectHierarchyPerson = (personId: string) => {
    setSelectedHierarchyPersonIds(prev =>
      prev.includes(personId) ? prev.filter(id => id !== personId) : [...prev, personId]
    )
    setTargetFamilyId('')
  }

  const handleDeleteRequest = (person: Person) => {
    setDeleteCandidate(person)
  }

  const handleConfirmDelete = () => {
    if (!deleteCandidate) return

    dispatch(
      deletePerson({
        personId: deleteCandidate.id,
      })
    )
    setSelectedHierarchyPersonIds(prev => prev.filter(id => id !== deleteCandidate.id))
    setDeleteCandidate(null)
  }

  return (
    <div className="app-page">
      <div className="app-shell">
        {!showTable ? (
          <>
            <div className="records-header">
              <div>
                <h1 className="records-title">Records</h1>
                <p className="records-subtitle">View and manage records of all church family members</p>
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
              Back to Records
            </button>

            {selectedFamily && (
              <div className="app-card records-family-shell">
                <div className="records-family-header">
                  <div className="records-family-title-row">
                    <h3 className="records-section-title">Family Details</h3>
                    <button
                      onClick={handleEditFamily}
                      className="records-family-edit-icon-btn"
                      aria-label="Edit Family Details"
                      title="Edit Family Details"
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M16.862 4.487a2.125 2.125 0 013.005 3.004L8.25 19.11l-4.125.938.937-4.125L16.862 4.487z"
                        />
                      </svg>
                    </button>
                  </div>
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

                {!showHierarchyEditor && (
                  <div className="records-family-actions">
                    <button onClick={handleEditHierarchy} className="app-btn-primary">
                      Edit Family Hierarchy
                    </button>
                  </div>
                )}

                {showHierarchyEditor && (
                  <div className="records-hierarchy-panel">
                    <h4 className="records-hierarchy-title">Family Hierarchy Editor</h4>
                    <p className="records-hierarchy-help">
                      Select a person in the records table below, then move them to another family or create a new family.
                    </p>

                    <div className="records-hierarchy-selected">
                      <p className="records-hierarchy-name">
                        Selected records: {selectedHierarchyPeople.length}
                      </p>
                      {selectedHierarchyPeople.length > 0 && (
                        <p className="records-hierarchy-sub">
                          {selectedHierarchyPeople
                            .map(person => `${person.first_name} ${person.last_name}`)
                            .join(', ')}
                        </p>
                      )}
                    </div>

                    <div className="records-hierarchy-top-actions">
                      <button onClick={handleDiscardHierarchy} className="app-back-link">
                        Discard
                      </button>
                      <button onClick={handleOpenSplitModal} className="app-btn-primary" disabled={selectedHierarchyPersonIds.length === 0}>
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
                            {showHierarchyEditor ? (
                              <button
                                onClick={() => handleSelectHierarchyPerson(person.id)}
                                className={`records-select-btn ${selectedHierarchyPersonIds.includes(person.id) ? 'records-select-btn-active' : ''}`}
                              >
                                {selectedHierarchyPersonIds.includes(person.id) ? 'Selected' : 'Select'}
                              </button>
                            ) : (
                              <div className="records-action-group">
                                <button
                                  onClick={() => handleEditPerson(person.id)}
                                  className="records-action-icon-btn"
                                  aria-label={`Edit ${person.first_name} ${person.last_name}`}
                                  title="Edit"
                                >
                                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      d="M16.862 4.487a2.125 2.125 0 013.005 3.004L8.25 19.11l-4.125.938.937-4.125L16.862 4.487z"
                                    />
                                  </svg>
                                </button>
                                <button
                                  onClick={() => handleDeleteRequest(person)}
                                  className="records-action-icon-btn records-action-icon-btn-delete"
                                  aria-label={`Delete ${person.first_name} ${person.last_name}`}
                                  title="Delete"
                                >
                                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      d="M3 6h18M9 6V4h6v2m-8 0l1 14h8l1-14"
                                    />
                                  </svg>
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
                    <button onClick={handleAddNewUser} className="records-footer-action">
                      Add new record
                    </button>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {deleteCandidate && (
        <div className="records-modal-overlay">
          <div className="records-modal">
            <div className="records-modal-header">
              <h3 className="records-modal-title">Delete Record</h3>
              <p className="records-modal-subtitle">
                Are you sure you want to delete {deleteCandidate.first_name} {deleteCandidate.last_name}?
              </p>
            </div>
            <div className="records-modal-footer">
              <button onClick={() => setDeleteCandidate(null)} className="app-btn-secondary">
                Cancel
              </button>
              <button onClick={handleConfirmDelete} className="app-btn-primary">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {showSplitModal && (
        <div className="records-modal-overlay">
          <div className="records-modal records-split-modal">
            <div className="records-modal-header">
              <h3 className="records-modal-title">Split Family</h3>
              <p className="records-modal-subtitle">
                {splitModalMode === 'choose'
                  ? 'Choose how to move the selected records.'
                  : 'Search a family record and merge selected members into it.'}
              </p>
            </div>

            <div className="records-modal-body">
              {splitModalMode === 'choose' ? (
                <>
                  <button onClick={handleCreateNewFamilyFromHierarchy} className="records-modal-option">
                    Create New Family
                  </button>
                  <button
                    onClick={() => setSplitModalMode('merge')}
                    className="records-modal-option records-modal-option-active"
                  >
                    Merge to Different Family
                  </button>
                </>
              ) : (
                <>
                  <input
                    type="text"
                    placeholder="Search family by name, code, or id"
                    value={familySearchQuery}
                    onChange={e => setFamilySearchQuery(e.target.value)}
                    className="app-input records-split-family-search"
                  />

                  <div className="records-split-family-list">
                    {filteredTargetFamilies.length > 0 ? (
                      filteredTargetFamilies.map(family => (
                        <button
                          key={family.id}
                          onClick={() => setTargetFamilyId(family.id)}
                          className={`records-split-family-item ${targetFamilyId === family.id ? 'records-split-family-item-active' : ''}`}
                        >
                          <span>{family.family_name}</span>
                          <span className="records-split-family-code">{family.family_code}</span>
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
              {splitModalMode === 'merge' && (
                <button onClick={() => setSplitModalMode('choose')} className="app-btn-secondary">
                  Back
                </button>
              )}
              <button onClick={closeSplitModal} className="app-btn-secondary">
                Cancel
              </button>
              {splitModalMode === 'merge' && (
                <button
                  onClick={handleMoveToDifferentFamily}
                  className="app-btn-primary"
                  disabled={selectedHierarchyPersonIds.length === 0 || !targetFamilyId}
                >
                  Merge Family
                </button>
              )}
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
