import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { getMockFamilies } from '@/data/mockData'
import { Family, Person } from '@/types/records'

interface RecordsState {
  families: Family[]
}

interface AddPersonPayload {
  familyId: string
  person: Person
}

interface UpdatePersonPayload {
  personId: string
  data: Partial<Person>
}

interface UpdateFamilyPayload {
  familyId: string
  data: Partial<Family>
}

interface DeletePersonPayload {
  personId: string
}

const initialState: RecordsState = {
  families: getMockFamilies(),
}

const recordsSlice = createSlice({
  name: 'records',
  initialState,
  reducers: {
    addFamily: (state, action: PayloadAction<Family>) => {
      state.families.push(action.payload)
    },
    updateFamily: (state, action: PayloadAction<UpdateFamilyPayload>) => {
      const family = state.families.find(f => f.id === action.payload.familyId)
      if (!family) return

      family.family_code = action.payload.data.family_code ?? family.family_code
      family.family_name = action.payload.data.family_name ?? family.family_name
      family.residential_address =
        action.payload.data.residential_address ?? family.residential_address
      family.office_address = action.payload.data.office_address ?? family.office_address
      family.area = action.payload.data.area ?? family.area
      family.updated_at = new Date().toISOString()
    },
    addPerson: (state, action: PayloadAction<AddPersonPayload>) => {
      const family = state.families.find(f => f.id === action.payload.familyId)
      if (!family) return

      family.members.push(action.payload.person)
      family.updated_at = new Date().toISOString()
    },
    updatePerson: (state, action: PayloadAction<UpdatePersonPayload>) => {
      const sourceFamily = state.families.find(f =>
        f.members.some(member => member.id === action.payload.personId)
      )
      if (!sourceFamily) return

      const sourceIndex = sourceFamily.members.findIndex(
        member => member.id === action.payload.personId
      )
      if (sourceIndex === -1) return

      const currentPerson = sourceFamily.members[sourceIndex]
      const desiredFamilyId = action.payload.data.familyId || sourceFamily.id

      if (desiredFamilyId !== sourceFamily.id) {
        const targetFamily = state.families.find(f => f.id === desiredFamilyId)
        if (!targetFamily) return

        const movedPerson: Person = {
          ...currentPerson,
          ...action.payload.data,
          familyId: targetFamily.id,
        }

        sourceFamily.members.splice(sourceIndex, 1)
        targetFamily.members.push(movedPerson)

        const now = new Date().toISOString()
        sourceFamily.updated_at = now
        targetFamily.updated_at = now
        return
      }

      sourceFamily.members[sourceIndex] = {
        ...currentPerson,
        ...action.payload.data,
        familyId: sourceFamily.id,
      }
      sourceFamily.updated_at = new Date().toISOString()
    },
    deletePerson: (state, action: PayloadAction<DeletePersonPayload>) => {
      const sourceFamily = state.families.find(f =>
        f.members.some(member => member.id === action.payload.personId)
      )
      if (!sourceFamily) return

      sourceFamily.members = sourceFamily.members.filter(
        member => member.id !== action.payload.personId
      )
      sourceFamily.updated_at = new Date().toISOString()
    },
  },
})

export const { addFamily, updateFamily, addPerson, updatePerson, deletePerson } = recordsSlice.actions
export default recordsSlice.reducer
