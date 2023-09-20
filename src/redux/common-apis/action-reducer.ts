import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import {InitialCommonApisStateType} from "@/types/common-apis/common-apis.type";

const initialState: any = {
  summary: null,
  isLoading: false
} as InitialCommonApisStateType

const commonApisSlice = createSlice({
  name: 'common-apis',
  initialState,
  reducers: {
    getSummary: (state: InitialCommonApisStateType, _action: PayloadAction<{}>) => {
      return {...state, isLoading: true, error: null}
    },
    getSummarySuccess: (state: InitialCommonApisStateType, _action: PayloadAction<{}>) => {
      return {...state, isLoading: false, error: null}
    },
    getSummaryError: (state: InitialCommonApisStateType, {payload: error}: PayloadAction<{ error: any }>) => {
      return {...state, isLoading: false, error}
    },
  }
})

export const {
  getSummary,
  getSummarySuccess,
  getSummaryError
} = commonApisSlice.actions
export default commonApisSlice.reducer
