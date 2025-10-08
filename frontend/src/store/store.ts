import { configureStore } from '@reduxjs/toolkit'
import loaderReducer from './loader';
import vendorReducer from './vendorSlice';
import ItemReducer from './ItemSlice'
import projectSlice from './ProjectSlice';
import teamSlice from './TeamSlice';
import  boqSlice from './BoqSlice';


export const store =  configureStore({
   reducer:{
    loader:loaderReducer,
    vendor:vendorReducer,
    item:ItemReducer,
    team: teamSlice,
    project:projectSlice,
    boq:boqSlice
   }
})

export type RootState = ReturnType<typeof store.getState>
 
export type AppDispatch = typeof store.dispatch;