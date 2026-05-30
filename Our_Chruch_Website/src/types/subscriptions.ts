export type SubscriptionCategoryKey =
  | 'subscriptionOffering'
  | 'MensfellowshipContribution'
  | 'womenfellowshipContribution'
  | 'churchBuildingFund'
  | 'ezhilanFund'
  | 'ims'
  | 'dbm'
  | 'fmpb'
  | 'evangelism'
  | 'elderlySupport'
  | 'emaaki'

export interface SubscriptionTableState {
  valuesByMonth: Record<string, Record<SubscriptionCategoryKey, string>>
  datesByMonth: Record<string, string>
  treasurerSignature: string
}

export interface SubscriptionFinancialYear {
  id: number
  yearLabel: string
  startDate: string
  endDate: string
  active: boolean
}

export interface SubscriptionCard {
  id: number | null
  personId: number
  familyId: number
  personName: string
  familyName: string
  memberNo?: string
  financialYearId: number
  financialYearLabel: string
  status: 'DRAFT' | 'SUBMITTED'
  isLocked: boolean
  totalAmount: number
  lastSavedAt?: string
  table: SubscriptionTableState
}

export interface SubscriptionAuditItem {
  id: number
  createdAt: string
  type: string
  month?: string
  fieldName: string
  oldValue?: string
  newValue?: string
}
