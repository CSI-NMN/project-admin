import { configureStore } from '@reduxjs/toolkit'
import recordsReducer from './slices/recordsSlice'
import adminReducer from './slices/adminSlice'
import authReducer from './slices/authSlice'

export const store = configureStore({
  reducer: {
    records: recordsReducer,
    admin: adminReducer,
    auth: authReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
