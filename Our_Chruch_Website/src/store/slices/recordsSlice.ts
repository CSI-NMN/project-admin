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
  },
})

export const { addFamily, addPerson, updatePerson } = recordsSlice.actions
export default recordsSlice.reducer
