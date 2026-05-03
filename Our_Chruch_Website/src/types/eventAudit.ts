export type EventAuditType = 'DECISION' | 'PURCHASE' | 'INCOME' | 'EXPENSE'

export interface EventAuditRecord {
  id: number
  type: EventAuditType
  description: string
  amount?: number
  itemName?: string
  quantity?: number
  unit?: string
  createdAt: string
}

export interface EventAuditEvent {
  id: number
  name: string
  startDate: string
  endDate: string
  status: 'LIVE' | 'PAST'
  live: boolean
  description?: string
  createdAt: string
  recordCount: number
}

export interface EventAuditEventDetail extends Omit<EventAuditEvent, 'recordCount'> {
  records: EventAuditRecord[]
}
