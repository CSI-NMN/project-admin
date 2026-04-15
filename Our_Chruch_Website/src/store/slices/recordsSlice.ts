import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { Family, Person } from '@/types/records'

interface RecordsState {
  families: Family[]
}

interface AddPersonPayload {
  familyId: number
  person: Person
}

interface UpdatePersonPayload {
  personId: number
  data: Partial<Person>
}

interface UpdateFamilyPayload {
  familyId: number
  data: Partial<Family>
}

interface DeletePersonPayload {
  personId: number
}

const initialState: RecordsState = {
  families: [],
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

      family.familyCode = action.payload.data.familyCode ?? family.familyCode
      family.familyName = action.payload.data.familyName ?? family.familyName
      family.address1 = action.payload.data.address1 ?? family.address1
      family.area = action.payload.data.area ?? family.area
      family.address2 = action.payload.data.address2 ?? family.address2
      family.pincode = action.payload.data.pincode ?? family.pincode
      family.city = action.payload.data.city ?? family.city
      family.state = action.payload.data.state ?? family.state
      family.familyHeadId = action.payload.data.familyHeadId ?? family.familyHeadId
      family.updatedAt = new Date().toISOString()
    },
    addPerson: (state, action: PayloadAction<AddPersonPayload>) => {
      const family = state.families.find(f => f.id === action.payload.familyId)
      if (!family) return

      family.members.push(action.payload.person)
      family.updatedAt = new Date().toISOString()
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
        sourceFamily.updatedAt = now
        targetFamily.updatedAt = now
        return
      }

      sourceFamily.members[sourceIndex] = {
        ...currentPerson,
        ...action.payload.data,
        familyId: sourceFamily.id,
      }
      sourceFamily.updatedAt = new Date().toISOString()
    },
    deletePerson: (state, action: PayloadAction<DeletePersonPayload>) => {
      const sourceFamily = state.families.find(f =>
        f.members.some(member => member.id === action.payload.personId)
      )
      if (!sourceFamily) return

      sourceFamily.members = sourceFamily.members.filter(
        member => member.id !== action.payload.personId
      )
      sourceFamily.updatedAt = new Date().toISOString()
    },
  },
})

export const { addFamily, updateFamily, addPerson, updatePerson, deletePerson } = recordsSlice.actions
export default recordsSlice.reducer

