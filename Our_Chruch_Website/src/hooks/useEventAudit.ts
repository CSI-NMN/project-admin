import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react'
import { showErrorToast, showSuccessToast } from '@/components/common/toast'
import { eventAuditService } from '@/store/api/eventAuditApi'
import { EventAuditEvent, EventAuditEventDetail, EventAuditType } from '@/types/eventAudit'

export const useEventAudit = () => {
  const [events, setEvents] = useState<EventAuditEvent[]>([])
  const [selectedEventId, setSelectedEventId] = useState<number | null>(null)
  const [selectedEvent, setSelectedEvent] = useState<EventAuditEventDetail | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [editingRecordId, setEditingRecordId] = useState<number | null>(null)

  const [eventForm, setEventForm] = useState({ name: '', startDate: '', endDate: '', description: '' })
  const [recordForm, setRecordForm] = useState({
    type: 'DECISION' as EventAuditType,
    description: '',
    amount: '',
    itemName: '',
    quantity: '',
    unit: '',
  })

  const selectedSummary = useMemo(
    () => events.find(item => item.id === selectedEventId) || null,
    [events, selectedEventId]
  )

  const loadEvents = useCallback(async () => {
    const items = await eventAuditService.listEvents()
    setEvents(items)
    if (!selectedEventId && items.length > 0) {
      setSelectedEventId(items[0].id)
    }
  }, [selectedEventId])

  const loadSelected = useCallback(async (eventId: number) => {
    const details = await eventAuditService.getEvent(eventId)
    setSelectedEvent(details)
    setEventForm({
      name: details.name,
      startDate: details.startDate,
      endDate: details.endDate,
      description: details.description || '',
    })
  }, [])

  useEffect(() => {
    loadEvents().catch(() => showErrorToast('Unable to load events.'))
  }, [loadEvents])

  useEffect(() => {
    if (!selectedEventId) {
      setSelectedEvent(null)
      return
    }
    setIsLoading(true)
    loadSelected(selectedEventId)
      .catch(() => showErrorToast('Unable to load event details.'))
      .finally(() => setIsLoading(false))
  }, [selectedEventId, loadSelected])

  const resetRecordForm = () => {
    setEditingRecordId(null)
    setRecordForm({
      type: 'DECISION',
      description: '',
      amount: '',
      itemName: '',
      quantity: '',
      unit: '',
    })
  }

  const onCreateEvent = async (event: FormEvent) => {
    event.preventDefault()
    if (!eventForm.name.trim() || !eventForm.startDate || !eventForm.endDate) {
      showErrorToast('Event name, start date and end date are required.')
      return
    }

    setIsSaving(true)
    try {
      const created = await eventAuditService.createEvent({
        name: eventForm.name.trim(),
        startDate: eventForm.startDate,
        endDate: eventForm.endDate,
        description: eventForm.description.trim() || undefined,
      })
      await loadEvents()
      setSelectedEventId(created.id)
      showSuccessToast('Event created.')
    } catch (error) {
      showErrorToast(error instanceof Error ? error.message : 'Unable to create event.')
    } finally {
      setIsSaving(false)
    }
  }

  const onUpdateEvent = async () => {
    if (!selectedEventId || !selectedSummary?.live) return
    if (!eventForm.name.trim() || !eventForm.startDate || !eventForm.endDate) {
      showErrorToast('Event name, start date and end date are required.')
      return
    }
    setIsSaving(true)
    try {
      await eventAuditService.updateEvent(selectedEventId, {
        name: eventForm.name.trim(),
        startDate: eventForm.startDate,
        endDate: eventForm.endDate,
        description: eventForm.description.trim() || undefined,
      })
      await loadEvents()
      await loadSelected(selectedEventId)
      showSuccessToast('Event updated.')
    } catch (error) {
      showErrorToast(error instanceof Error ? error.message : 'Unable to update event.')
    } finally {
      setIsSaving(false)
    }
  }

  const onDeleteEvent = async () => {
    if (!selectedEventId || !selectedSummary?.live) return
    setIsSaving(true)
    try {
      await eventAuditService.deleteEvent(selectedEventId)
      const remaining = events.filter(item => item.id !== selectedEventId)
      setEvents(remaining)
      setSelectedEventId(remaining[0]?.id ?? null)
      setSelectedEvent(null)
      resetRecordForm()
      showSuccessToast('Event deleted.')
    } catch (error) {
      showErrorToast(error instanceof Error ? error.message : 'Unable to delete event.')
    } finally {
      setIsSaving(false)
    }
  }

  const onSaveRecord = async (event: FormEvent) => {
    event.preventDefault()
    if (!selectedEventId || !selectedSummary?.live) return
    if (!recordForm.description.trim()) {
      showErrorToast('Description is required.')
      return
    }
    setIsSaving(true)
    try {
      const payload = {
        type: recordForm.type,
        description: recordForm.description.trim(),
        amount: recordForm.amount ? Number(recordForm.amount) : undefined,
        itemName: recordForm.itemName.trim() || undefined,
        quantity: recordForm.quantity ? Number(recordForm.quantity) : undefined,
        unit: recordForm.unit.trim() || undefined,
      }

      if (editingRecordId) {
        await eventAuditService.updateRecord(selectedEventId, editingRecordId, payload)
        showSuccessToast('Record updated.')
      } else {
        await eventAuditService.createRecord(selectedEventId, payload)
        showSuccessToast('Record added.')
      }
      await loadEvents()
      await loadSelected(selectedEventId)
      resetRecordForm()
    } catch (error) {
      showErrorToast(error instanceof Error ? error.message : 'Unable to save record.')
    } finally {
      setIsSaving(false)
    }
  }

  const onDeleteRecord = async (recordId: number) => {
    if (!selectedEventId || !selectedSummary?.live) return
    setIsSaving(true)
    try {
      await eventAuditService.deleteRecord(selectedEventId, recordId)
      await loadEvents()
      await loadSelected(selectedEventId)
      if (editingRecordId === recordId) {
        resetRecordForm()
      }
      showSuccessToast('Record deleted.')
    } catch (error) {
      showErrorToast(error instanceof Error ? error.message : 'Unable to delete record.')
    } finally {
      setIsSaving(false)
    }
  }

  const onEditRecord = (recordId: number) => {
    const record = selectedEvent?.records.find(item => item.id === recordId)
    if (!record) return
    setEditingRecordId(record.id)
    setRecordForm({
      type: record.type,
      description: record.description,
      amount: record.amount?.toString() || '',
      itemName: record.itemName || '',
      quantity: record.quantity?.toString() || '',
      unit: record.unit || '',
    })
  }

  return {
    events,
    selectedEventId,
    setSelectedEventId,
    selectedEvent,
    selectedSummary,
    isLoading,
    isSaving,
    editingRecordId,
    eventForm,
    setEventForm,
    recordForm,
    setRecordForm,
    resetRecordForm,
    onCreateEvent,
    onUpdateEvent,
    onDeleteEvent,
    onSaveRecord,
    onDeleteRecord,
    onEditRecord,
  }
}
