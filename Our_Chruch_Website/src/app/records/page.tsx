'use client'

import './records.css'
import { Suspense, useEffect, useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Family, Person } from '@/types/records'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { deletePerson, updatePerson } from '@/store/slices/recordsSlice'
import { buildSearchIndex, matchesRecordSearch } from '@/utils/records'
import RecordsSearchSection from '@/components/records/RecordsSearchSection'
import FamilyDetailsSection from '@/components/records/FamilyDetailsSection'
import DeleteRecordModal from '@/components/records/DeleteRecordModal'
import SplitFamilyModal, { SplitModalMode } from '@/components/records/SplitFamilyModal'

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
  const [splitModalMode, setSplitModalMode] = useState<SplitModalMode>('choose')
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

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    const query = event.target.value
    setSearchQuery(query)

    const normalizedQuery = query.trim().toLowerCase()
    const numericQuery = query.replace(/\D/g, '')

    if (!normalizedQuery) {
      setSearchResults([])
      setSelectedFamily(null)
      setShowTable(false)
      return
    }

    const results = searchIndex
      .filter(entry => matchesRecordSearch(entry, normalizedQuery, numericQuery))
      .map(entry => entry.person)

    setSearchResults(results)
    setSelectedFamily(null)
    setShowTable(false)
  }

  const handleClearSearch = () => {
    setSearchQuery('')
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

  const handleBackToResults = () => {
    setShowTable(false)
    setSelectedFamily(null)
    setShowHierarchyEditor(false)
    resetHierarchyState()
    router.push('/records')
  }

  const handleEditPerson = (personId: string) => {
    router.push(`/records/edit?id=${personId}`)
  }

  const handleEditFamily = () => {
    if (!selectedFamily?.id) return
    router.push(`/records/family-edit?familyId=${selectedFamily.id}`)
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

  const handleOpenSplitModal = () => {
    if (selectedHierarchyPersonIds.length === 0) return
    setShowSplitModal(true)
    setSplitModalMode('choose')
    setFamilySearchQuery('')
    setTargetFamilyId('')
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

    dispatch(deletePerson({ personId: deleteCandidate.id }))
    setSelectedHierarchyPersonIds(prev => prev.filter(id => id !== deleteCandidate.id))
    setDeleteCandidate(null)
  }

  return (
    <div className="app-page">
      <div className="app-shell">
        {!showTable && (
          <RecordsSearchSection
            searchQuery={searchQuery}
            searchResults={searchResults}
            families={families}
            onSearchChange={handleSearch}
            onClearSearch={handleClearSearch}
            onSelectRecord={handleSelectRecord}
            onCreateNewFamily={handleCreateNewRecord}
          />
        )}

        {showTable && selectedFamily && (
          <FamilyDetailsSection
            selectedFamily={selectedFamily}
            showHierarchyEditor={showHierarchyEditor}
            selectedHierarchyPeople={selectedHierarchyPeople}
            selectedHierarchyPersonIds={selectedHierarchyPersonIds}
            onBackToRecords={handleBackToResults}
            onEditFamily={handleEditFamily}
            onEditHierarchy={handleEditHierarchy}
            onDiscardHierarchy={handleDiscardHierarchy}
            onOpenSplitModal={handleOpenSplitModal}
            onSelectHierarchyPerson={handleSelectHierarchyPerson}
            onEditPerson={handleEditPerson}
            onDeleteRequest={handleDeleteRequest}
            onAddNewRecord={handleAddNewUser}
          />
        )}
      </div>

      <DeleteRecordModal
        deleteCandidate={deleteCandidate}
        onCancel={() => setDeleteCandidate(null)}
        onConfirm={handleConfirmDelete}
      />

      <SplitFamilyModal
        show={showSplitModal}
        mode={splitModalMode}
        familySearchQuery={familySearchQuery}
        filteredTargetFamilies={filteredTargetFamilies}
        targetFamilyId={targetFamilyId}
        canMerge={selectedHierarchyPersonIds.length > 0 && Boolean(targetFamilyId)}
        onClose={closeSplitModal}
        onCreateNewFamily={handleCreateNewFamilyFromHierarchy}
        onModeChange={setSplitModalMode}
        onFamilySearchChange={setFamilySearchQuery}
        onTargetFamilySelect={setTargetFamilyId}
        onMerge={handleMoveToDifferentFamily}
      />
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
