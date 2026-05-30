export type AdminRole = 'Church Admin' | 'Chairman' | 'Secretary' | 'Treasurer'

export interface AdminRecord {
  id: number
  personId: number
  memberId: number | null
  name: string
  email: string
  role: AdminRole
}
