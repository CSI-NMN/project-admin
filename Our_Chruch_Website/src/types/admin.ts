export type AdminRole = 'Church Admin' | 'Chairman' | 'Secretary' | 'Treasurer'

export interface AdminRecord {
  id: string
  personId: string
  memberId: string
  name: string
  email: string
  role: AdminRole
}
