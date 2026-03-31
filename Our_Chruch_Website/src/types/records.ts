export interface Family {
  id: string
  familyCode: string
  familyName: string
  address1?: string
  area?: string
  address2?: string
  pincode?: string
  city?: string
  state?: string
  familyHeadId?: string
  createdAt?: string
  updatedAt?: string
  members: Person[]
}

export interface Person {
  id: string
  familyId: string
  memberNo?: string
  firstName: string
  lastName?: string
  fatherName?: string
  motherName?: string
  gender?: string
  maritalStatus?: string
  dateOfBirth?: string
  dateOfBaptism?: string
  dateOfConfirmation?: string
  dateOfMarriage?: string
  bloodGroup?: string
  profession?: string
  mobileNo?: string
  aadhaarNumber?: string
  email?: string
  relationshipType?: string
  isHead: boolean
  createdAt?: string
  updatedAt?: string
}

export type CelebrationFeedType = 'birthdays' | 'anniversaries'

export interface CelebrationFeedItem {
  id: string
  name: string
  familyName: string
  familyCode: string
  eventDateLabel: string
  eventDay: number
  mobile: string
  email: string
  actionPersonId: string
  actionFamilyId: string
}

export interface CelebrationsDto {
  month: number
  monthLabel: string
  birthdaysCount: number
  anniversariesCount: number
  birthdays: CelebrationFeedItem[]
  anniversaries: CelebrationFeedItem[]
}
