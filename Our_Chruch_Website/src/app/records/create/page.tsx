'use client'

import { Suspense, useEffect, useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import RecordsForm from '@/components/records/RecordsForm'
import FamilyForm from '@/components/records/FamilyForm'
import { Family, Person } from '@/types/records'
import { recordsService } from '@/store/api/recordsApi'
import { showErrorToast, showInfoToast } from '@/components/common/toast'

type Step = 'family' | 'person'

function CreateRecordPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const mode = searchParams.get('mode')
  const familyIdFromQuery = searchParams.get('familyId')
  const resolvedFamilyIdFromQuery = familyIdFromQuery ? Number(familyIdFromQuery) : null
  const movePersonIdsParam =
    searchParams.get('movePersonIds') || searchParams.get('movePersonId') || ''
  const movePersonIds = movePersonIdsParam
    .split(',')
    .map(id => Number(id.trim()))
    .filter(id => Number.isFinite(id) && id > 0)

  const isDirectPersonMode = mode === 'person'
  const isMovePersonToNewFamily = movePersonIds.length > 0

  const [families, setFamilies] = useState<Family[]>([])
  const [step, setStep] = useState<Step>(isDirectPersonMode ? 'person' : 'family')
  const [familyDraft, setFamilyDraft] = useState<Partial<Family> | null>(null)

  const selectedFamilyFromQuery = useMemo(
    () => families.find(f => f.id === resolvedFamilyIdFromQuery) || null,
    [families, resolvedFamilyIdFromQuery]
  )

  useEffect(() => {
    recordsService
      .listFamilies({
        $top: 1000,
        $skip: 0,
      })
      .then(data => {
        setFamilies(data)
      })
      .catch(() => {
        setFamilies([])
      })
  }, [])

  const handleFamilySubmit = async (data: Partial<Family>) => {
    try {
      if (isMovePersonToNewFamily) {
        const family = await recordsService.createFamily(data)
        setFamilies(prev => [...prev, family])
        await Promise.all(
          movePersonIds.map(personId => recordsService.moveFamilyMember(personId, family.id))
        )
        router.push(`/records?familyId=${family.id}`)
        return
      }

      setFamilyDraft(data)
      setStep('person')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to create family'
      showErrorToast(message)
    }
  }

  const handlePersonSubmit = async (data: Partial<Person>) => {
    try {
      const targetFamilyId = data.familyId || resolvedFamilyIdFromQuery
      if (targetFamilyId) {
        await recordsService.addFamilyMember(targetFamilyId, data)
        router.push(`/records?familyId=${targetFamilyId}`)
        return
      }

      if (!familyDraft) {
        showInfoToast('Please enter family details first.')
        return
      }

      const createdFamily = await recordsService.createFamily({
        ...familyDraft,
        members: [data as Person],
      })
      setFamilies(prev => [...prev, createdFamily])
      router.push(`/records?familyId=${createdFamily.id}`)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to create person'
      showErrorToast(message)
    }
  }

  const handleBackClick = () => {
    if (isMovePersonToNewFamily) {
      router.push('/records')
      return
    }

    if (isDirectPersonMode) {
      if (resolvedFamilyIdFromQuery) {
        router.push(`/records?familyId=${resolvedFamilyIdFromQuery}`)
        return
      }
      router.push('/records')
      return
    }

    if (step === 'person') {
      setStep('family')
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

  const initialPersonData = resolvedFamilyIdFromQuery
    ? { familyId: resolvedFamilyIdFromQuery }
    : undefined

  const forceHeadSelection =
    Boolean(familyDraft) ||
    (Boolean(resolvedFamilyIdFromQuery) && (selectedFamilyFromQuery?.members.length ?? 0) === 0)

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
            <span className="app-step-muted">Step 1: Family Details Saved</span>
            <span className="app-step-arrow">-&gt;</span>
            <span className="app-step-active">Step 2: Add Person</span>
          </div>
        )}

        {!isDirectPersonMode && step === 'family' && (
          <FamilyForm
            initialData={familyDraft || undefined}
            onSubmit={handleFamilySubmit}
            onCancel={() => router.push('/records')}
          />
        )}

        {((!isDirectPersonMode && step === 'person' && !isMovePersonToNewFamily) || isDirectPersonMode) && (
          <>
            {(familyDraft || selectedFamilyFromQuery) && (
              <div className="app-info-banner">
                <p className="app-info-text">
                  <span className="app-info-strong">Family:</span>{' '}
                  {familyDraft?.familyName || selectedFamilyFromQuery?.familyName}
                  {(selectedFamilyFromQuery?.familyCode && !familyDraft) ? ` (${selectedFamilyFromQuery.familyCode})` : ''}
                </p>
              </div>
            )}
            <RecordsForm
              initialData={initialPersonData}
              isNew={true}
              families={families}
              hideFamily={Boolean(resolvedFamilyIdFromQuery || familyDraft)}
              forceHeadSelection={forceHeadSelection}
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
