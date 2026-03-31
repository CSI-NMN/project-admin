'use client'

import './records.css'
import { Suspense, useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Family, Person } from '@/types/records'
import { recordsService } from '@/store/api/recordsApi'
import RecordsSearchSection from '@/components/records/RecordsSearchSection'
import FamilyDetailsSection from '@/components/records/FamilyDetailsSection'
import DeleteRecordModal from '@/components/records/DeleteRecordModal'
import SplitFamilyModal, { SplitModalMode } from '@/components/records/SplitFamilyModal'
import { showErrorToast, showInfoToast } from '@/components/common/toast'

function AdminRecordsPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [families, setFamilies] = useState<Family[]>([])

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

  const selectedFamilyId = selectedFamily?.id || ''

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
        family.familyName.toLowerCase().includes(query) ||
        family.familyCode.toLowerCase().includes(query)
    )
  }, [availableFamilies, familySearchQuery])

  const fetchFamilies = useCallback(async () => {
    const data = await recordsService.listFamilies({
      $top: 1000,
      $skip: 0,
    })
    setFamilies(data)
  }, [])

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

  useEffect(() => {
    fetchFamilies().catch(() => {
      setFamilies([])
    })
  }, [fetchFamilies])

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

  useEffect(() => {
    const query = searchQuery.trim()
    if (!query) {
      setSearchResults([])
      return
    }

    let active = true
    const numericQuery = query.replace(/\D/g, '')
    const normalizedQuery = query.toLowerCase()

    recordsService
      .searchFamilies({
        memberName: query,
        phoneNumber: query,
        aadhaarNumber: query,
        $top: 300,
        $skip: 0,
      })
      .then(results => {
        if (!active) return

        const flattened = results
          .flatMap(family =>
            family.members
              .filter(member => {
                const fullName = `${member.firstName} ${member.lastName || ''}`.toLowerCase()
                const subscription = (member.memberNo || '').toLowerCase()
                const phone = (member.mobileNo || '').toLowerCase()
                const phoneDigits = phone.replace(/\D/g, '')
                const aadhaar = (member.aadhaarNumber || '').toLowerCase()

                return (
                  fullName.includes(normalizedQuery) ||
                  subscription.includes(normalizedQuery) ||
                  phone.includes(normalizedQuery) ||
                  aadhaar.includes(normalizedQuery) ||
                  family.familyCode.toLowerCase().includes(normalizedQuery) ||
                  (numericQuery.length > 0 && phoneDigits.includes(numericQuery))
                )
              })
              .map(member => ({ ...member, familyId: family.id }))
          )
          .sort((a, b) => `${a.firstName} ${a.lastName || ''}`.localeCompare(`${b.firstName} ${b.lastName || ''}`))

        setSearchResults(flattened)
      })
      .catch(() => {
        if (!active) return
        setSearchResults([])
      })

    return () => {
      active = false
    }
  }, [searchQuery])

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    const query = event.target.value
    setSearchQuery(query)

    if (!query.trim()) {
      setSearchResults([])
      setSelectedFamily(null)
      setShowTable(false)
    }
  }

  const handleClearSearch = () => {
    setSearchQuery('')
    setSearchResults([])
    setSelectedFamily(null)
    setShowTable(false)
  }

  const handleSelectRecord = async (person: Person) => {
    let family = families.find(f => f.id === person.familyId) || null

    if (!family) {
      try {
        family = await recordsService.getFamilyById(person.familyId)
        setFamilies(prev => {
          if (prev.some(item => item.id === family?.id)) {
            return prev
          }
          return family ? [...prev, family] : prev
        })
      } catch {
        family = null
      }
    }

    setSelectedFamily(family)
    setShowTable(Boolean(family))
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
    if (!selectedFamily?.id) return
    router.push(`/records/edit?familyId=${selectedFamily.id}&id=${personId}`)
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
      showInfoToast('Select at least one person first from the records table.')
      return
    }

    closeSplitModal()
    const movePersonIds = encodeURIComponent(selectedHierarchyPersonIds.join(','))
    router.push(`/records/create?movePersonIds=${movePersonIds}`)
  }

  const handleMoveToDifferentFamily = async () => {
    if (selectedHierarchyPersonIds.length === 0 || !targetFamilyId) {
      showInfoToast('Select one or more people and a target family.')
      return
    }

    try {
      await Promise.all(
        selectedHierarchyPersonIds.map(personId =>
          recordsService.moveFamilyMember(personId, targetFamilyId)
        )
      )

      await fetchFamilies()
      setShowHierarchyEditor(false)
      resetHierarchyState()
      router.push(`/records?familyId=${targetFamilyId}`)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to move person'
      showErrorToast(message)
    }
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

  const handleConfirmDelete = async () => {
    if (!deleteCandidate || !selectedFamily?.id) return

    try {
      await recordsService.deleteFamilyMember(selectedFamily.id, deleteCandidate.id)
      await fetchFamilies()
      setSelectedHierarchyPersonIds(prev => prev.filter(id => id !== deleteCandidate.id))
      setDeleteCandidate(null)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to delete person'
      showErrorToast(message)
    }
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
