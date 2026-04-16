import { apiRequest } from '@/store/api/baseApi'
import {
  ApiSubscriptionCardResponse,
  ApiSubscriptionFinancialYearResponse,
  ODataCollectionResponse,
} from '@/types/api'
import { Family, Person } from '@/types/records'
import { SubscriptionCard, SubscriptionFinancialYear, SubscriptionTableState } from '@/types/subscriptions'

const CATEGORY_KEYS = [
  'subscriptionOffering',
  'MensfellowshipContribution',
  'womenfellowshipContribution',
  'churchBuildingFund',
  'ezhilanFund',
  'ims',
  'dbm',
  'fmpb',
  'evangelism',
  'elderlySupport',
  'emaaki',
] as const

const MONTHS = ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar']

const createEmptyTable = (): SubscriptionTableState => ({
  valuesByMonth: Object.fromEntries(
    MONTHS.map(month => [
      month,
      Object.fromEntries(CATEGORY_KEYS.map(key => [key, ''])) as Record<(typeof CATEGORY_KEYS)[number], string>,
    ])
  ),
  datesByMonth: Object.fromEntries(MONTHS.map(month => [month, ''])),
  treasurerSignature: '',
})

const mapFinancialYear = (year: ApiSubscriptionFinancialYearResponse): SubscriptionFinancialYear => ({
  id: year.id,
  yearLabel: year.yearLabel,
  startDate: year.startDate,
  endDate: year.endDate,
  active: year.active,
})

const parseTablePayload = (payload: string): SubscriptionTableState => {
  if (!payload) return createEmptyTable()
  try {
    const parsed = JSON.parse(payload) as Partial<SubscriptionTableState>
    return {
      valuesByMonth: parsed.valuesByMonth || createEmptyTable().valuesByMonth,
      datesByMonth: parsed.datesByMonth || createEmptyTable().datesByMonth,
      treasurerSignature: parsed.treasurerSignature || '',
    }
  } catch {
    return createEmptyTable()
  }
}

const mapCard = (card: ApiSubscriptionCardResponse): SubscriptionCard => ({
  id: card.id,
  personId: card.personId,
  familyId: card.familyId,
  personName: card.personName,
  familyName: card.familyName,
  memberNo: card.memberNo || undefined,
  financialYearId: card.financialYearId,
  financialYearLabel: card.financialYearLabel,
  status: card.status,
  isLocked: card.isLocked,
  totalAmount: Number(card.totalAmount || 0),
  lastSavedAt: card.lastSavedAt || undefined,
  table: parseTablePayload(card.cardPayload),
})

export const subscriptionsService = {
  months: MONTHS,
  categoryKeys: CATEGORY_KEYS,
  createEmptyTable,

  async searchPeople(query: string): Promise<Person[]> {
    const results = await apiRequest<ODataCollectionResponse<Family>>('/odata/Records/search', {
      query: {
        familyCode: query,
        memberNo: query,
        memberName: query,
        phoneNumber: query,
        aadhaarNumber: query,
        $top: 100,
        $skip: 0,
      },
    })
    const normalized = query.trim().toLowerCase()
    return (results.value || [])
      .flatMap(family => family.members.map(member => ({ ...member, familyId: family.id })))
      .filter(member => {
        const fullName = `${member.firstName} ${member.lastName || ''}`.toLowerCase()
        return (
          fullName.includes(normalized) ||
          String(member.memberNo || '').includes(normalized) ||
          String(member.membershipName || '').toLowerCase().includes(normalized) ||
          String(member.mobileNo || '').toLowerCase().includes(normalized) ||
          String(member.aadhaarNumber || '').toLowerCase().includes(normalized)
        )
      })
  },

  async listFinancialYears(): Promise<SubscriptionFinancialYear[]> {
    const payload = await apiRequest<ApiSubscriptionFinancialYearResponse[]>('/odata/Subscriptions/financial-years')
    return payload.map(mapFinancialYear)
  },

  async createFinancialYear(input: {
    yearLabel: string
    startDate: string
    endDate: string
    active: boolean
  }): Promise<SubscriptionFinancialYear> {
    const payload = await apiRequest<ApiSubscriptionFinancialYearResponse>('/odata/Subscriptions/financial-years', {
      method: 'POST',
      body: input,
    })
    return mapFinancialYear(payload)
  },

  async getCard(personId: number, financialYearId: number): Promise<SubscriptionCard> {
    const payload = await apiRequest<ApiSubscriptionCardResponse>('/odata/Subscriptions', {
      query: { personId, financialYearId },
    })
    return mapCard(payload)
  },

  async saveCard(input: {
    personId: number
    financialYearId: number
    status: 'DRAFT' | 'SUBMITTED'
    totalAmount: number
    lockRecord: boolean
    table: SubscriptionTableState
  }): Promise<SubscriptionCard> {
    const payload = await apiRequest<ApiSubscriptionCardResponse>('/odata/Subscriptions', {
      method: 'PUT',
      body: {
        personId: input.personId,
        financialYearId: input.financialYearId,
        status: input.status,
        cardPayload: JSON.stringify(input.table),
        totalAmount: input.totalAmount,
        lockRecord: input.lockRecord,
      },
    })
    return mapCard(payload)
  },

  async updateFamilyContributions(input: {
    familyId: number
    financialYearId: number
    table: SubscriptionTableState
    totalAmount: number
  }): Promise<number> {
    const payload = await apiRequest<{ updatedMembers: number }>('/odata/Subscriptions/family-contributions', {
      method: 'PATCH',
      body: {
        familyId: input.familyId,
        financialYearId: input.financialYearId,
        cardPayload: JSON.stringify(input.table),
        totalAmount: input.totalAmount,
      },
    })
    return payload.updatedMembers
  },
}
