export interface ODataCollectionResponse<T> {
  value: T[]
  '@odata.count'?: number
}

export interface ApiPersonResponse {
  id: string
  familyId: string
  memberNo: string | null
  firstName: string
  lastName: string | null
  fatherName: string | null
  motherName: string | null
  gender: string | null
  maritalStatus: string | null
  dateOfBirth: string | null
  dateOfBaptism: string | null
  dateOfConfirmation: string | null
  dateOfMarriage: string | null
  bloodGroup: string | null
  profession: string | null
  mobileNo: string | null
  aadhaarNumber: string | null
  email: string | null
  relationshipType: string | null
  isHead: boolean
  createdAt: string | null
  updatedAt: string | null
}

export interface ApiFamilyResponse {
  id: string
  familyCode: string
  familyName: string
  address1: string | null
  area: string | null
  address2: string | null
  pincode: string | null
  city: string | null
  state: string | null
  familyHeadId: string | null
  createdAt: string
  updatedAt: string
  members: ApiPersonResponse[]
}

export interface ApiCelebrationFeedItem {
  id: string
  type: 'birthday' | 'anniversary'
  name: string
  familyName: string
  familyCode: string
  eventDateLabel: string
  eventDay: number
  mobile: string | null
  email: string | null
  actionPersonId: string
  actionFamilyId: string
}

export interface ApiCelebrationsResponse {
  month: number
  monthLabel: string
  birthdaysCount: number
  anniversariesCount: number
  birthdays: ApiCelebrationFeedItem[]
  anniversaries: ApiCelebrationFeedItem[]
}
