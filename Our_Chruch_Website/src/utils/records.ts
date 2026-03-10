import { Family, Person } from '@/types/records'

export interface PersonWithFamily {
  person: Person
  family: Family
}

export const createUniqueId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`

export const buildFamily = (data: Partial<Family>): Family => {
  const now = new Date().toISOString()

  return {
    id: createUniqueId(),
    family_code: data.family_code || '',
    family_name: data.family_name || '',
    residential_address: data.residential_address,
    office_address: data.office_address,
    area: data.area,
    created_at: now,
    updated_at: now,
    members: [],
  }
}

export const buildPerson = (data: Partial<Person>, familyId: string): Person => ({
  id: createUniqueId(),
  subscriptionCardNo: data.subscriptionCardNo || '',
  first_name: data.first_name || '',
  last_name: data.last_name || '',
  father_name: data.father_name,
  mother_name: data.mother_name,
  gender: data.gender,
  marital_status: data.marital_status,
  date_of_birth: data.date_of_birth,
  date_of_baptism: data.date_of_baptism,
  date_of_confirmation: data.date_of_confirmation,
  date_of_marriage: data.date_of_marriage,
  blood_group: data.blood_group,
  profession: data.profession,
  mobile_no: data.mobile_no,
  email: data.email,
  relationship_type: data.relationship_type || 'Child',
  is_head: data.is_head || false,
  familyId,
})

export const findPersonWithFamily = (
  families: Family[],
  personId: string | null
): PersonWithFamily | null => {
  if (!personId) return null

  for (const family of families) {
    const person = family.members.find(member => member.id === personId)
    if (person) {
      return { person, family }
    }
  }

  return null
}

export const buildSearchIndex = (families: Family[]): PersonWithFamily[] =>
  families.flatMap(family => family.members.map(person => ({ person, family })))

export const matchesRecordSearch = (
  entry: PersonWithFamily,
  normalizedQuery: string,
  numericQuery: string
): boolean => {
  const fullName = `${entry.person.first_name} ${entry.person.last_name}`.toLowerCase()
  const subscriptionId = (entry.person.subscriptionCardNo || '').toLowerCase()
  const phone = (entry.person.mobile_no || '').toLowerCase()
  const phoneDigits = phone.replace(/\D/g, '')
  const familyId = entry.family.id.toLowerCase()
  const familyCode = (entry.family.family_code || '').toLowerCase()

  return (
    fullName.includes(normalizedQuery) ||
    subscriptionId.includes(normalizedQuery) ||
    phone.includes(normalizedQuery) ||
    (numericQuery.length > 0 && phoneDigits.includes(numericQuery)) ||
    familyId.includes(normalizedQuery) ||
    familyCode.includes(normalizedQuery)
  )
}
