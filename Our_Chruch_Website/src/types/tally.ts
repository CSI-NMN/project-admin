export interface TallyCategory {
  key: string
  label: string
  amount: number
  reason: string
  editable: boolean
}

export interface TallyTableState {
  categories: TallyCategory[]
}

export interface TallyData {
  id: number | null
  financialYearId: number
  month: string
  income: TallyTableState
  expense: TallyTableState
  totalIncome: number
  totalExpense: number
  lastSavedAt?: string
}