import { apiRequest, QueryValue } from '@/store/api/baseApi'
import {
  ApiCelebrationFeedItem,
  ApiCelebrationsResponse,
  ApiFamilyResponse,
  ApiPersonResponse,
  ODataCollectionResponse,
} from '@/types/api'
import { CelebrationFeedItem, CelebrationsDto, Family, Person } from '@/types/records'

const mapPerson = (person: ApiPersonResponse): Person => ({
  id: person.id,
  familyId: person.familyId,
  memberNo: person.memberNo || '',
  firstName: person.firstName || '',
  lastName: person.lastName || '',
  fatherName: person.fatherName || undefined,
  motherName: person.motherName || undefined,
  gender: person.gender || undefined,
  maritalStatus: person.maritalStatus || undefined,
  dateOfBirth: person.dateOfBirth || undefined,
  dateOfBaptism: person.dateOfBaptism || undefined,
  dateOfConfirmation: person.dateOfConfirmation || undefined,
  dateOfMarriage: person.dateOfMarriage || undefined,
  bloodGroup: person.bloodGroup || undefined,
  profession: person.profession || undefined,
  mobileNo: person.mobileNo || undefined,
  aadhaarNumber: person.aadhaarNumber || undefined,
  email: person.email || undefined,
  relationshipType: person.relationshipType || 'Child',
  isHead: Boolean(person.isHead),
  createdAt: person.createdAt || undefined,
  updatedAt: person.updatedAt || undefined,
})

const mapFamily = (family: ApiFamilyResponse): Family => ({
  id: family.id,
  familyCode: family.familyCode,
  familyName: family.familyName,
  address1: family.address1 || undefined,
  area: family.area || undefined,
  address2: family.address2 || undefined,
  pincode: family.pincode || undefined,
  city: family.city || undefined,
  state: family.state || undefined,
  familyHeadId: family.familyHeadId || undefined,
  createdAt: family.createdAt,
  updatedAt: family.updatedAt,
  members: (family.members || []).map(mapPerson),
})

const mapCelebrationItem = (item: ApiCelebrationFeedItem): CelebrationFeedItem => ({
  id: item.id,
  name: item.name,
  familyName: item.familyName,
  familyCode: item.familyCode,
  eventDateLabel: item.eventDateLabel,
  eventDay: item.eventDay,
  mobile: item.mobile || '',
  email: item.email || '',
  actionPersonId: item.actionPersonId,
  actionFamilyId: item.actionFamilyId,
})

const mapPersonPayload = (data: Partial<Person>) => ({
  memberNo: data.memberNo || null,
  firstName: data.firstName || '',
  lastName: data.lastName || null,
  fatherName: data.fatherName || null,
  motherName: data.motherName || null,
  gender: data.gender || null,
  maritalStatus: data.maritalStatus || null,
  dateOfBirth: data.dateOfBirth || null,
  dateOfBaptism: data.dateOfBaptism || null,
  dateOfConfirmation: data.dateOfConfirmation || null,
  dateOfMarriage: data.dateOfMarriage || null,
  bloodGroup: data.bloodGroup || null,
  profession: data.profession || null,
  mobileNo: data.mobileNo || null,
  aadhaarNumber: data.aadhaarNumber || null,
  email: data.email || null,
  relationshipType: data.relationshipType || null,
  isHead: data.isHead ?? false,
})

const pickDefined = <T extends Record<string, unknown>>(payload: T): Partial<T> =>
  Object.fromEntries(
    Object.entries(payload).filter(([, value]) => value !== undefined)
  ) as Partial<T>

export const recordsService = {
  async listFamilies(query: Record<string, QueryValue> = {}): Promise<Family[]> {
    const payload = await apiRequest<ODataCollectionResponse<ApiFamilyResponse>>('/odata/Records', {
      query,
    })
    return (payload.value || []).map(mapFamily)
  },

  async searchFamilies(query: Record<string, QueryValue> = {}): Promise<Family[]> {
    const payload = await apiRequest<ODataCollectionResponse<ApiFamilyResponse>>('/odata/Records/search', {
      query,
    })
    return (payload.value || []).map(mapFamily)
  },

  async getFamilyById(familyId: string): Promise<Family> {
    const payload = await apiRequest<ApiFamilyResponse>(`/odata/Records/${familyId}`)
    return mapFamily(payload)
  },

  async createFamily(data: Partial<Family>): Promise<Family> {
    const payload = {
      familyCode: data.familyCode || null,
      familyName: data.familyName || '',
      address1: data.address1 || null,
      area: data.area || null,
      address2: data.address2 || null,
      pincode: data.pincode || null,
      city: data.city || null,
      state: data.state || null,
      members: data.members?.map(mapPersonPayload) || [],
    }

    const created = await apiRequest<ApiFamilyResponse>('/odata/Records', {
      method: 'POST',
      body: payload,
    })

    return mapFamily(created)
  },

  async updateFamily(familyId: string, data: Partial<Family>): Promise<Family> {
    const payload = pickDefined({
      familyCode: data.familyCode,
      familyName: data.familyName,
      address1: data.address1 === '' ? null : data.address1,
      area: data.area === '' ? null : data.area,
      address2: data.address2 === '' ? null : data.address2,
      pincode: data.pincode === '' ? null : data.pincode,
      city: data.city === '' ? null : data.city,
      state: data.state === '' ? null : data.state,
    })

    const updated = await apiRequest<ApiFamilyResponse>(`/odata/Records/${familyId}`, {
      method: 'PATCH',
      body: payload,
    })

    return mapFamily(updated)
  },

  async addFamilyMember(familyId: string, data: Partial<Person>): Promise<Person> {
    const payload = mapPersonPayload(data)

    const created = await apiRequest<ApiPersonResponse>(`/odata/Records/${familyId}/Persons`, {
      method: 'POST',
      body: payload,
    })

    return mapPerson(created)
  },

  async getFamilyMemberById(familyId: string, personId: string): Promise<Person> {
    const payload = await apiRequest<ApiPersonResponse>(`/odata/Records/${familyId}/Persons/${personId}`)
    return mapPerson(payload)
  },

  async updateFamilyMember(familyId: string, personId: string, data: Partial<Person>): Promise<Person> {
    const payload = pickDefined({
      memberNo: data.memberNo === '' ? null : data.memberNo,
      firstName: data.firstName,
      lastName: data.lastName === '' ? null : data.lastName,
      fatherName: data.fatherName === '' ? null : data.fatherName,
      motherName: data.motherName === '' ? null : data.motherName,
      gender: data.gender === '' ? null : data.gender,
      maritalStatus: data.maritalStatus === '' ? null : data.maritalStatus,
      dateOfBirth: data.dateOfBirth === '' ? null : data.dateOfBirth,
      dateOfBaptism: data.dateOfBaptism === '' ? null : data.dateOfBaptism,
      dateOfConfirmation: data.dateOfConfirmation === '' ? null : data.dateOfConfirmation,
      dateOfMarriage: data.dateOfMarriage === '' ? null : data.dateOfMarriage,
      bloodGroup: data.bloodGroup === '' ? null : data.bloodGroup,
      profession: data.profession === '' ? null : data.profession,
      mobileNo: data.mobileNo === '' ? null : data.mobileNo,
      aadhaarNumber: data.aadhaarNumber === '' ? null : data.aadhaarNumber,
      email: data.email === '' ? null : data.email,
      relationshipType: data.relationshipType === '' ? null : data.relationshipType,
      isHead: data.isHead,
    })

    const updated = await apiRequest<ApiPersonResponse>(`/odata/Records/${familyId}/Persons/${personId}`, {
      method: 'PATCH',
      body: payload,
    })

    return mapPerson(updated)
  },

  async deleteFamilyMember(familyId: string, personId: string): Promise<void> {
    await apiRequest<void>(`/odata/Records/${familyId}/Persons/${personId}`, {
      method: 'DELETE',
    })
  },

  async moveFamilyMember(personId: string, targetFamilyId: string): Promise<Person> {
    const updated = await apiRequest<ApiPersonResponse>(`/odata/Records/Persons/${personId}/move`, {
      method: 'PATCH',
      body: { targetFamilyId },
    })
    return mapPerson(updated)
  },

  async getCelebrations(month?: number): Promise<CelebrationsDto> {
    const payload = await apiRequest<ApiCelebrationsResponse>('/odata/Records/celebrations', {
      query: { month },
    })

    return {
      month: payload.month,
      monthLabel: payload.monthLabel,
      birthdaysCount: payload.birthdaysCount,
      anniversariesCount: payload.anniversariesCount,
      birthdays: (payload.birthdays || []).map(mapCelebrationItem),
      anniversaries: (payload.anniversaries || []).map(mapCelebrationItem),
    }
  },
}
