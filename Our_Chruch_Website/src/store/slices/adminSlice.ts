import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { AdminRecord } from '@/types/admin'

interface AdminState {
  admins: AdminRecord[]
}

const initialState: AdminState = {
  admins: [
    {
      id: 'admin-001',
      personId: '550e8400-e29b-41d4-a716-446655440001',
      memberId: '5341930004628032',
      name: 'John Doe',
      email: 'john.doe@example.com',
      role: 'Church Admin',
    },
    {
      id: 'admin-002',
      personId: '550e8400-e29b-41d4-a716-446655440002',
      memberId: '6342030005628033',
      name: 'Jane Doe',
      email: 'jane.doe@example.com',
      role: 'Chairman',
    },
    {
      id: 'admin-003',
      personId: '550e8400-e29b-41d4-a716-446655440011',
      memberId: '7812450099628101',
      name: 'Raj Kumar',
      email: 'raj.kumar@example.com',
      role: 'Secretary',
    },
    {
      id: 'admin-004',
      personId: '550e8400-e29b-41d4-a716-446655440012',
      memberId: '7812450099628102',
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
      action: PayloadAction<{ adminId: string; role: AdminRecord['role'] }>
    ) => {
      const admin = state.admins.find(item => item.id === action.payload.adminId)
      if (!admin) return
      admin.role = action.payload.role
    },
    removeAdmin: (state, action: PayloadAction<{ adminId: string }>) => {
      state.admins = state.admins.filter(admin => admin.id !== action.payload.adminId)
    },
  },
})

export const { addAdmin, updateAdminRole, removeAdmin } = adminSlice.actions
export default adminSlice.reducer
