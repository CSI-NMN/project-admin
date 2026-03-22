'use client'

import { Suspense, useMemo } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import RecordsForm from '@/components/records/RecordsForm'
import { Person } from '@/types/records'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { updatePerson } from '@/store/slices/recordsSlice'
import { findPersonWithFamily } from '@/utils/records'

function EditRecordPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const dispatch = useAppDispatch()

  const personId = searchParams.get('id')
  const source = searchParams.get('source')
  const families = useAppSelector(state => state.records.families)

  const record = useMemo(() => findPersonWithFamily(families, personId), [families, personId])

  const buildReturnUrl = (familyId?: string) => {
    if (source === 'celebrations') {
      return '/celebrations'
    }

    if (familyId) {
      return `/records?familyId=${familyId}`
    }

    return '/records'
  }

  const handleSubmit = (data: Partial<Person>) => {
    if (!personId) return

    dispatch(
      updatePerson({
        personId,
        data,
      })
    )

    const targetFamilyId = data.familyId || record?.person.familyId
    router.push(buildReturnUrl(targetFamilyId))
  }

  const handleCancel = () => {
    router.push(buildReturnUrl(record?.person.familyId))
  }

  if (!record) {
    return (
      <div className="app-page">
        <div className="app-shell">
          <p className="app-empty-text">Person record not found.</p>
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
          {source === 'celebrations' ? 'Back to Celebrations' : 'Back to Records'}
        </button>

        <RecordsForm
          initialData={record.person}
          isNew={false}
          families={families}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
      </div>
    </div>
  )
}


export default function EditRecordPage() {
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
      <EditRecordPageContent />
    </Suspense>
  )
}
