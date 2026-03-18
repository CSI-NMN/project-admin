import { ChangeEvent } from 'react'
import { Family, Person } from '@/types/records'

interface RecordsSearchSectionProps {
  searchQuery: string
  searchResults: Person[]
  families: Family[]
  onSearchChange: (event: ChangeEvent<HTMLInputElement>) => void
  onClearSearch: () => void
  onSelectRecord: (person: Person) => void
  onCreateNewFamily: () => void
}

export default function RecordsSearchSection({
  searchQuery,
  searchResults,
  families,
  onSearchChange,
  onClearSearch,
  onSelectRecord,
  onCreateNewFamily,
}: RecordsSearchSectionProps) {
  return (
    <>
      <div className="records-header">
        <div>
          <h1 className="records-title">Records</h1>
          <p className="records-subtitle">View and manage records of all church family members</p>
        </div>
        <button onClick={onCreateNewFamily} className="app-btn-primary">
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
            onChange={onSearchChange}
            className="records-search-input"
          />
          {searchQuery && (
            <button onClick={onClearSearch} className="records-search-clear">
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
            <button key={person.id} onClick={() => onSelectRecord(person)} className="records-result-item">
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
  )
}
