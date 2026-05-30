import { apiRequest } from '@/store/api/baseApi'
import {
  ApiEventAuditEventDetailResponse,
  ApiEventAuditEventResponse,
  ApiEventAuditRecordResponse,
} from '@/types/api'
import { EventAuditEvent, EventAuditEventDetail, EventAuditRecord, EventAuditType } from '@/types/eventAudit'

const mapRecord = (record: ApiEventAuditRecordResponse): EventAuditRecord => ({
  id: record.id,
  type: record.type,
  description: record.description,
  amount: record.amount ?? undefined,
  itemName: record.itemName ?? undefined,
  quantity: record.quantity ?? undefined,
  unit: record.unit ?? undefined,
  createdAt: record.createdAt,
})

const mapEvent = (event: ApiEventAuditEventResponse): EventAuditEvent => ({
  id: event.id,
  name: event.name,
  startDate: event.startDate,
  endDate: event.endDate,
  status: event.status,
  live: event.live,
  description: event.description ?? undefined,
  createdAt: event.createdAt,
  recordCount: event.recordCount,
})

const mapDetail = (event: ApiEventAuditEventDetailResponse): EventAuditEventDetail => ({
  id: event.id,
  name: event.name,
  startDate: event.startDate,
  endDate: event.endDate,
  status: event.status,
  live: event.live,
  description: event.description ?? undefined,
  createdAt: event.createdAt,
  records: (event.records || []).map(mapRecord),
})

export const eventAuditService = {
  async listEvents(): Promise<EventAuditEvent[]> {
    const payload = await apiRequest<ApiEventAuditEventResponse[]>('/odata/EventAudit/events')
    return payload.map(mapEvent)
  },

  async createEvent(input: { name: string; startDate: string; endDate: string; description?: string }): Promise<EventAuditEvent> {
    const payload = await apiRequest<ApiEventAuditEventResponse>('/odata/EventAudit/events', {
      method: 'POST',
      body: input,
    })
    return mapEvent(payload)
  },

  async getEvent(eventId: number): Promise<EventAuditEventDetail> {
    const payload = await apiRequest<ApiEventAuditEventDetailResponse>(`/odata/EventAudit/events/${eventId}`)
    return mapDetail(payload)
  },

  async updateEvent(eventId: number, input: { name: string; startDate: string; endDate: string; description?: string }): Promise<EventAuditEvent> {
    const payload = await apiRequest<ApiEventAuditEventResponse>(`/odata/EventAudit/events/${eventId}`, {
      method: 'PATCH',
      body: input,
    })
    return mapEvent(payload)
  },

  async deleteEvent(eventId: number): Promise<void> {
    await apiRequest<void>(`/odata/EventAudit/events/${eventId}`, { method: 'DELETE' })
  },

  async createRecord(
    eventId: number,
    input: { type: EventAuditType; description: string; amount?: number; itemName?: string; quantity?: number; unit?: string }
  ): Promise<EventAuditRecord> {
    const payload = await apiRequest<ApiEventAuditRecordResponse>(`/odata/EventAudit/events/${eventId}/records`, {
      method: 'POST',
      body: input,
    })
    return mapRecord(payload)
  },

  async updateRecord(
    eventId: number,
    recordId: number,
    input: { type: EventAuditType; description: string; amount?: number; itemName?: string; quantity?: number; unit?: string }
  ): Promise<EventAuditRecord> {
    const payload = await apiRequest<ApiEventAuditRecordResponse>(`/odata/EventAudit/events/${eventId}/records/${recordId}`, {
      method: 'PATCH',
      body: input,
    })
    return mapRecord(payload)
  },

  async deleteRecord(eventId: number, recordId: number): Promise<void> {
    await apiRequest<void>(`/odata/EventAudit/events/${eventId}/records/${recordId}`, { method: 'DELETE' })
  },
}
