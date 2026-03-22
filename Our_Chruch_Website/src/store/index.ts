import { configureStore } from '@reduxjs/toolkit'
import recordsReducer from './slices/recordsSlice'
import adminReducer from './slices/adminSlice'

export const store = configureStore({
  reducer: {
    records: recordsReducer,
    admin: adminReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
