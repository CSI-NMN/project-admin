'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import RecordsForm from '@/components/records/RecordsForm'
import { Family, Person } from '@/types/records'
import { recordsService } from '@/store/api/recordsApi'
import { showErrorToast } from '@/components/common/toast'

function EditRecordPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const personIdParam = searchParams.get('id')
  const familyIdParam = searchParams.get('familyId')
  const personId = personIdParam ? Number(personIdParam) : null
  const familyId = familyIdParam ? Number(familyIdParam) : null
  const source = searchParams.get('source')

  const [families, setFamilies] = useState<Family[]>([])
  const [record, setRecord] = useState<Person | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!personId || !familyId) {
      setLoading(false)
      setRecord(null)
      return
    }

    let active = true
    setLoading(true)

    Promise.all([
      recordsService.getFamilyMemberById(familyId, personId),
      recordsService.listFamilies({ $top: 1000, $skip: 0 }),
    ])
      .then(([person, familyList]) => {
        if (!active) return
        setRecord(person)
        setFamilies(familyList)
      })
      .catch(() => {
        if (!active) return
        setRecord(null)
        setFamilies([])
      })
      .finally(() => {
        if (!active) return
        setLoading(false)
      })

    return () => {
      active = false
    }
  }, [familyId, personId])

  const buildReturnUrl = (resolvedFamilyId?: number) => {
    if (source === 'celebrations') {
      return '/celebrations'
    }

    if (resolvedFamilyId) {
      return `/records?familyId=${resolvedFamilyId}`
    }

    return '/records'
  }

  const handleSubmit = async (data: Partial<Person>) => {
    if (!personId || !familyId) return

    try {
      const updated = await recordsService.updateFamilyMember(familyId, personId, data)
      router.push(buildReturnUrl(updated.familyId))
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to update person'
      showErrorToast(message)
    }
  }

  const handleCancel = () => {
    router.push(buildReturnUrl(record?.familyId || familyId || undefined))
  }

  if (loading) {
    return (
      <div className="app-page">
        <div className="app-shell">
          <p className="app-empty-text">Loading...</p>
        </div>
      </div>
    )
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
          initialData={record}
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
