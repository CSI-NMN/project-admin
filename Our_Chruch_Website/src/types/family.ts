export interface Person {
  id: string
  subscriptionCardNo: string
  first_name: string
  last_name: string
  father_name?: string
  mother_name?: string
  gender?: string
  marital_status?: string
  date_of_birth?: string
  date_of_baptism?: string
  date_of_confirmation?: string
  date_of_marriage?: string
  blood_group?: string
  profession?: string
  mobile_no?: string
  email?: string
  relationship_type: string
  is_head: boolean
  familyId: string
}

export interface Family {
  id: string
  family_code: string
  family_name: string
  residential_address?: string
  office_address?: string
  area?: string
  created_at: string
  updated_at: string
  members: Person[]
}
