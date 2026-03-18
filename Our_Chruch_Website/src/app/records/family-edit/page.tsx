'use client'

import { Suspense, useMemo } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import FamilyForm from '@/components/FamilyForm'
import { Family } from '@/types/records'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { updateFamily } from '@/store/slices/recordsSlice'

function EditFamilyPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const dispatch = useAppDispatch()

  const familyId = searchParams.get('familyId')
  const families = useAppSelector(state => state.records.families)

  const family = useMemo(
    () => families.find(item => item.id === familyId) || null,
    [families, familyId]
  )

  const handleSubmit = (data: Partial<Family>) => {
    if (!family?.id) return

    dispatch(
      updateFamily({
        familyId: family.id,
        data,
      })
    )

    router.push(`/records?familyId=${family.id}`)
  }

  const handleCancel = () => {
    if (family?.id) {
      router.push(`/records?familyId=${family.id}`)
      return
    }
    router.push('/records')
  }

  if (!family) {
    return (
      <div className="app-page">
        <div className="app-shell">
          <p className="app-empty-text">Family record not found.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="app-page">
      <div className="app-shell">
        <button onClick={handleCancel} className="app-back-link mb-6">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Records
        </button>

        <FamilyForm
          initialData={family}
          isEdit={true}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
      </div>
    </div>
  )
}

export default function EditFamilyPage() {
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
      <EditFamilyPageContent />
    </Suspense>
  )
}
