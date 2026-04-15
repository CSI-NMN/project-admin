export interface Family {
  id: number
  familyCode: string
  familyName: string
  address1?: string
  area?: string
  address2?: string
  pincode?: string
  city?: string
  state?: string
  familyHeadId?: number
  createdAt?: string
  updatedAt?: string
  members: Person[]
}

export interface Person {
  id: number
  familyId: number
  memberNo?: number
  membershipName?: string
  firstName: string
  lastName?: string
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
  createSubscription?: boolean
  subscriptionName?: string
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
  actionPersonId: number
  actionFamilyId: number
}

export interface CelebrationsDto {
  month: number
  monthLabel: string
  birthdaysCount: number
  anniversariesCount: number
  birthdays: CelebrationFeedItem[]
  anniversaries: CelebrationFeedItem[]
}
