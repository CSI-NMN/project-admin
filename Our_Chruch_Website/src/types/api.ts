export interface ODataCollectionResponse<T> {
  value: T[]
  '@odata.count'?: number
}

export interface ApiPersonResponse {
  id: number
  familyId: number
  memberNo: number | null
  membershipName: string | null
  firstName: string
  lastName: string | null
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
  id: number
  familyCode: string
  familyName: string
  address1: string | null
  area: string | null
  address2: string | null
  pincode: string | null
  city: string | null
  state: string | null
  familyHeadId: number | null
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
  actionPersonId: number
  actionFamilyId: number
}

export interface ApiCelebrationsResponse {
  month: number
  monthLabel: string
  birthdaysCount: number
  anniversariesCount: number
  birthdays: ApiCelebrationFeedItem[]
  anniversaries: ApiCelebrationFeedItem[]
}

export interface ApiSubscriptionFinancialYearResponse {
  id: number
  yearLabel: string
  startDate: string
  endDate: string
  active: boolean
}

export interface ApiSubscriptionAuditItemResponse {
  id: number
  createdAt: string
  type: string
  month: string | null
  fieldName: string
  oldValue: string | null
  newValue: string | null
}

export interface ApiTallyResponse {
  id: number | null
  financialYearId: number
  month: string
  incomePayload: string
  expensePayload: string
  totalIncome: number
  totalExpense: number
  lastSavedAt: string | null
}

export interface ApiEventAuditEventResponse {
  id: number
  name: string
  startDate: string
  endDate: string
  status: 'LIVE' | 'PAST'
  live: boolean
  description: string | null
  createdAt: string
  recordCount: number
}

export interface ApiEventAuditRecordResponse {
  id: number
  type: 'DECISION' | 'PURCHASE' | 'INCOME' | 'EXPENSE'
  description: string
  amount: number | null
  itemName: string | null
  quantity: number | null
  unit: string | null
  createdAt: string
}

export interface ApiEventAuditEventDetailResponse {
  id: number
  name: string
  startDate: string
  endDate: string
  status: 'LIVE' | 'PAST'
  live: boolean
  description: string | null
  createdAt: string
  records: ApiEventAuditRecordResponse[]
}
