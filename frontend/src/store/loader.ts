import { createSlice } from '@reduxjs/toolkit'

const STATUS = Object.freeze({
  IDLE: 'idle',
  ERROR: 'error',
  LOADING: 'loading'
});

const initialState = {
  loadingStatus: STATUS.IDLE,
  isLoading: false,
  bodyClass:'page-body'
}

export const loadingSlice = createSlice({
  name: "loading",
  initialState,
  reducers: {
    setLoading(state, { payload }) {
      state.isLoading=payload
    },
    changeBodyClass(state, { payload }) {
      state.bodyClass=payload
    },
  }
})

export const { setLoading,changeBodyClass } = loadingSlice.actions;

export default loadingSlice.reducer;

/*LOGIN GET OTP*/
export function callSetLoading(status) {
  return async function loadingThunk(dispatch) {
    try {
      dispatch(setLoading(status))
    } catch (err) {

    }
  }
}



