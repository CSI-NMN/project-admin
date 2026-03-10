'use client'

import { Suspense, useMemo } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import RecordsForm from '@/components/RecordsForm'
import { Person } from '@/types/records'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { updatePerson } from '@/store/slices/recordsSlice'
import { findPersonWithFamily } from '@/utils/records'

function EditRecordPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const dispatch = useAppDispatch()

  const personId = searchParams.get('id')
  const families = useAppSelector(state => state.records.families)

  const record = useMemo(() => findPersonWithFamily(families, personId), [families, personId])

  const handleSubmit = (data: Partial<Person>) => {
    if (!personId) return

    dispatch(
      updatePerson({
        personId,
        data,
      })
    )

    const targetFamilyId = data.familyId || record?.person.familyId
    alert('Person saved successfully!')

    if (targetFamilyId) {
      router.push(`/records?familyId=${targetFamilyId}`)
      return
    }

    router.push('/records')
  }

  const handleCancel = () => {
    if (record?.person.familyId) {
      router.push(`/records?familyId=${record.person.familyId}`)
      return
    }
    router.push('/records')
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
          Back to Records
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
