import { apiRequest } from '@/store/api/baseApi'
import { ApiTallyResponse } from '@/types/api'
import { TallyData, TallyTableState } from '@/types/tally'

const parseTablePayload = (payload: string): TallyTableState => {
  if (!payload) return { categories: [] }
  try {
    const parsed = JSON.parse(payload) as Partial<TallyTableState>
    return {
      categories: parsed.categories || [],
    }
  } catch {
    return { categories: [] }
  }
}

const mapTally = (tally: ApiTallyResponse): TallyData => ({
  id: tally.id,
  financialYearId: tally.financialYearId,
  month: tally.month,
  income: parseTablePayload(tally.incomePayload),
  expense: parseTablePayload(tally.expensePayload),
  totalIncome: Number(tally.totalIncome || 0),
  totalExpense: Number(tally.totalExpense || 0),
  lastSavedAt: tally.lastSavedAt || undefined,
})

export const tallyService = {
  async getTally(financialYearId: number, month: string): Promise<TallyData> {
    const response = await apiRequest<ApiTallyResponse>('/odata/Tally', {
      query: {
        financialYearId,
        month,
      },
    })
    return mapTally(response)
  },

  async saveTally(data: {
    financialYearId: number
    month: string
    income: TallyTableState
    expense: TallyTableState
    totalIncome: number
    totalExpense: number
  }): Promise<TallyData> {
    const response = await apiRequest<ApiTallyResponse>('/odata/Tally', {
      method: 'PUT',
      body: {
        financialYearId: data.financialYearId,
        month: data.month,
        incomePayload: JSON.stringify(data.income),
        expensePayload: JSON.stringify(data.expense),
        totalIncome: data.totalIncome,
        totalExpense: data.totalExpense,
      },
    })
    return mapTally(response)
  },
}