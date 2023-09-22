import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import {InitialCommonApisStateType} from "@/types/common-apis/common-apis.type";

const initialState: any = {
  summary: null,
  isLoading: false,
  showCreateProjectModal: false,
  shouldRedirectOnCreateProject: false,
  syncingEmails: null,
  isComposing: false,
  contacts: []
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

    getProjectSummary: (state: InitialCommonApisStateType, _action: PayloadAction<{ mailbox?: string, id?: string, account?: string, mine?: boolean, resetState?: boolean, query?: string }>) => {
      return {...state, isLoading: true, error: null}
    },
    getProjectSummarySuccess: (state: InitialCommonApisStateType, _action: PayloadAction<{}>) => {
      return {...state, isLoading: false, error: null}
    },
    getProjectSummaryError: (state: InitialCommonApisStateType, {payload: error}: PayloadAction<{ error: any }>) => {
      return {...state, isLoading: false, error}
    },

    getContacts: (state: InitialCommonApisStateType, _action: PayloadAction<{ }>) => {
      return {...state, contacts: [], isLoading: true, error: null}
    },
    getContactsSuccess: (state: InitialCommonApisStateType, {payload: contacts}: PayloadAction<any>) => {
      return {...state, contacts, isLoading: false, error: null}
    },
    getContactsError: (state: InitialCommonApisStateType, {payload: error}: PayloadAction<{ error: any }>) => {
      return {...state, contacts: [], isLoading: false, error}
    },

    updateCommonState: (state: InitialCommonApisStateType, action: PayloadAction<InitialCommonApisStateType>) => {
      return {...state, ...action.payload}
    },

  }
})

export const {
  getSummary,
  getSummarySuccess,
  getSummaryError,
  getProjectSummary,
  getProjectSummarySuccess,
  getProjectSummaryError,
  getContacts,
  getContactsSuccess,
  getContactsError,
  updateCommonState
} = commonApisSlice.actions
export default commonApisSlice.reducer
