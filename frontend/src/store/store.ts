import { configureStore } from '@reduxjs/toolkit'
import loaderReducer from './loader';
import vendorReducer from './vendorSlice'


export const store =  configureStore({
   reducer:{
    loader:loaderReducer,
    vendor:vendorReducer
    
   }
})

export type RootState = ReturnType<typeof store.getState>
 
export type AppDispatch = typeof store.dispatch;