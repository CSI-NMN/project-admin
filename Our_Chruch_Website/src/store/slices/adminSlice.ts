import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { AdminRecord } from '@/types/admin'

interface AdminState {
  admins: AdminRecord[]
}

const initialState: AdminState = {
  admins: [
    {
      id: 1,
      personId: 1,
      memberId: 1,
      name: 'John Doe',
      email: 'john.doe@example.com',
      role: 'Church Admin',
    },
    {
      id: 2,
      personId: 2,
      memberId: 2,
      name: 'Jane Doe',
      email: 'jane.doe@example.com',
      role: 'Chairman',
    },
    {
      id: 3,
      personId: 3,
      memberId: 3,
      name: 'Raj Kumar',
      email: 'raj.kumar@example.com',
      role: 'Secretary',
    },
    {
      id: 4,
      personId: 4,
      memberId: 4,
      name: 'Jeni Kumar',
      email: 'jeni.kumar@example.com',
      role: 'Treasurer',
    },
  ],
}

const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    addAdmin: (state, action: PayloadAction<AdminRecord>) => {
      state.admins.push(action.payload)
    },
    updateAdminRole: (
      state,
      action: PayloadAction<{ adminId: number; role: AdminRecord['role'] }>
    ) => {
      const admin = state.admins.find(item => item.id === action.payload.adminId)
      if (!admin) return
      admin.role = action.payload.role
    },
    removeAdmin: (state, action: PayloadAction<{ adminId: number }>) => {
      state.admins = state.admins.filter(admin => admin.id !== action.payload.adminId)
    },
  },
})

export const { addAdmin, updateAdminRole, removeAdmin } = adminSlice.actions
export default adminSlice.reducer
