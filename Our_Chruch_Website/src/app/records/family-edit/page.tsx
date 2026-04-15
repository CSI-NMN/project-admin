'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import FamilyForm from '@/components/records/FamilyForm'
import { Family } from '@/types/records'
import { recordsService } from '@/store/api/recordsApi'
import { showErrorToast } from '@/components/common/toast'

function EditFamilyPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const familyIdParam = searchParams.get('familyId')
  const familyId = familyIdParam ? Number(familyIdParam) : null
  const [family, setFamily] = useState<Family | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!familyId) {
      setFamily(null)
      setLoading(false)
      return
    }

    let active = true
    setLoading(true)

    recordsService
      .getFamilyById(familyId)
      .then(data => {
        if (!active) return
        setFamily(data)
      })
      .catch(() => {
        if (!active) return
        setFamily(null)
      })
      .finally(() => {
        if (!active) return
        setLoading(false)
      })

    return () => {
      active = false
    }
  }, [familyId])

  const handleSubmit = async (data: Partial<Family>) => {
    if (!family?.id) return

    try {
      await recordsService.updateFamily(family.id, data)
      router.push(`/records?familyId=${family.id}`)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to update family'
      showErrorToast(message)
    }
  }

  const handleCancel = () => {
    if (family?.id) {
      router.push(`/records?familyId=${family.id}`)
      return
    }
    router.push('/records')
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
