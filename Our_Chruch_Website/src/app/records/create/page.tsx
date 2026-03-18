'use client'

import { Suspense, useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import RecordsForm from '@/components/RecordsForm'
import FamilyForm from '@/components/FamilyForm'
import { Family, Person } from '@/types/records'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { addFamily, addPerson, updatePerson } from '@/store/slices/recordsSlice'
import { buildFamily, buildPerson } from '@/utils/records'

type Step = 'family' | 'person'

function CreateRecordPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const dispatch = useAppDispatch()
  const families = useAppSelector(state => state.records.families)

  const mode = searchParams.get('mode')
  const familyIdFromQuery = searchParams.get('familyId') || ''
  const movePersonIdsParam =
    searchParams.get('movePersonIds') || searchParams.get('movePersonId') || ''
  const movePersonIds = movePersonIdsParam
    .split(',')
    .map(id => id.trim())
    .filter(Boolean)

  const isDirectPersonMode = mode === 'person'
  const isMovePersonToNewFamily = movePersonIds.length > 0

  const selectedFamilyFromQuery = useMemo(
    () => families.find(f => f.id === familyIdFromQuery) || null,
    [families, familyIdFromQuery]
  )

  const [step, setStep] = useState<Step>(isDirectPersonMode ? 'person' : 'family')
  const [newFamily, setNewFamily] = useState<Family | null>(null)

  const handleFamilySubmit = (data: Partial<Family>) => {
    const family = buildFamily(data)
    setNewFamily(family)
    dispatch(addFamily(family))

    if (isMovePersonToNewFamily) {
      movePersonIds.forEach(personId => {
        dispatch(
          updatePerson({
            personId,
            data: { familyId: family.id },
          })
        )
      })
      router.push(`/records?familyId=${family.id}`)
      return
    }

    setStep('person')
  }

  const handlePersonSubmit = (data: Partial<Person>) => {
    const targetFamilyId = newFamily?.id || data.familyId || familyIdFromQuery
    if (!targetFamilyId) {
      alert('Please select a family before creating a person.')
      return
    }

    const person = buildPerson(data, targetFamilyId)
    dispatch(
      addPerson({
        familyId: targetFamilyId,
        person,
      })
    )
    router.push(`/records?familyId=${targetFamilyId}`)
  }

  const handleBackClick = () => {
    if (isMovePersonToNewFamily) {
      router.push('/records')
      return
    }

    if (isDirectPersonMode) {
      if (familyIdFromQuery) {
        router.push(`/records?familyId=${familyIdFromQuery}`)
        return
      }
      router.push('/records')
      return
    }

    if (step === 'person') {
      setStep('family')
      setNewFamily(null)
      return
    }

    router.push('/records')
  }

  const backLabel = isMovePersonToNewFamily
    ? 'Back to Records'
    : isDirectPersonMode
      ? 'Back to Records'
      : step === 'person'
        ? 'Back to Family'
        : 'Back to Records'

  const activeFamily = newFamily || selectedFamilyFromQuery
  const initialPersonData = familyIdFromQuery
    ? { familyId: familyIdFromQuery }
    : newFamily
      ? { familyId: newFamily.id }
      : undefined

  return (
    <div className="app-page">
      <div className="app-shell">
        <button onClick={handleBackClick} className="app-back-link mb-6">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          {backLabel}
        </button>

        {isMovePersonToNewFamily && (
          <div className="app-info-banner">
            <p className="app-info-text">
              <span className="app-info-strong">Move Person:</span> Create a new family and the selected record(s) will be moved there.
            </p>
          </div>
        )}

        {!isDirectPersonMode && !isMovePersonToNewFamily && step === 'person' && (
          <div className="app-step-indicator">
            <span className="app-step-muted">Step 1: Family Created</span>
            <span className="app-step-arrow">-&gt;</span>
            <span className="app-step-active">Step 2: Add Person</span>
          </div>
        )}

        {!isDirectPersonMode && step === 'family' && (
          <FamilyForm onSubmit={handleFamilySubmit} onCancel={() => router.push('/records')} />
        )}

        {((!isDirectPersonMode && step === 'person' && !isMovePersonToNewFamily) || isDirectPersonMode) && (
          <>
            {activeFamily && (
              <div className="app-info-banner">
                <p className="app-info-text">
                  <span className="app-info-strong">Family:</span> {activeFamily.family_name} ({activeFamily.family_code})
                </p>
              </div>
            )}
            <RecordsForm
              initialData={initialPersonData}
              isNew={true}
              families={families}
              hideFamily={Boolean(familyIdFromQuery || newFamily?.id)}
              onSubmit={handlePersonSubmit}
              onCancel={handleBackClick}
            />
          </>
        )}
      </div>
    </div>
  )
}

export default function CreateRecordPage() {
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
      <CreateRecordPageContent />
    </Suspense>
  )
}
