import { FormEvent, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { showErrorToast, showSuccessToast } from '@/components/common/toast'
import { eventAuditService } from '@/store/api/eventAuditApi'

const getToday = () => new Date().toISOString().slice(0, 10)

export const useCreateEventPage = () => {
  const router = useRouter()
  const [isSaving, setIsSaving] = useState(false)
  const [form, setForm] = useState({
    name: '',
    startDate: getToday(),
    endDate: '',
    description: '',
  })

  const canSubmit = useMemo(() => {
    return Boolean(form.name.trim() && form.startDate && form.endDate)
  }, [form.name, form.startDate, form.endDate])

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    if (!canSubmit) {
      showErrorToast('Name, start date and end date are required.')
      return
    }

    setIsSaving(true)
    try {
      await eventAuditService.createEvent({
        name: form.name.trim(),
        startDate: form.startDate,
        endDate: form.endDate,
        description: form.description.trim() || undefined,
      })
      showSuccessToast('Event created.')
      router.push('/event-audit')
    } catch (error) {
      showErrorToast(error instanceof Error ? error.message : 'Unable to create event.')
    } finally {
      setIsSaving(false)
    }
  }

  return { form, setForm, isSaving, canSubmit, submit }
}
