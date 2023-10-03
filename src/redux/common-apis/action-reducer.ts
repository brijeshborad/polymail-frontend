import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import {InitialCommonApisStateType} from "@/types/common-apis/common-apis.type";
import { ReducerActionType } from "@/types";

const initialState: any = {
  summary: null,
  isLoading: false,
  showCreateProjectModal: false,
  shouldRedirectOnCreateProject: false,
  syncingEmails: null,
  isComposing: false,
  contacts: [],
  allowThreadSelection: true,
  onlineUsers: {threads: {}, projects: {}}
} as InitialCommonApisStateType

const commonApisSlice = createSlice({
  name: 'common-apis',
  initialState,
  reducers: {
    getSummary: (state: InitialCommonApisStateType, _action: PayloadAction<ReducerActionType>) => {
      return {...state, isLoading: true}
    },
    getSummarySuccess: (state: InitialCommonApisStateType, _action: PayloadAction<{}>) => {
      return {...state, isLoading: false, error: null}
    },
    getSummaryError: (state: InitialCommonApisStateType, _action: PayloadAction<any>) => {
      return {...state, isLoading: false}
    },

    getProjectSummary: (state: InitialCommonApisStateType, _action: PayloadAction<ReducerActionType>) => {
      return {...state, isLoading: true}
    },
    getProjectSummarySuccess: (state: InitialCommonApisStateType, _action: PayloadAction<{}>) => {
      return {...state, isLoading: false}
    },
    getProjectSummaryError: (state: InitialCommonApisStateType, _action: PayloadAction<any>) => {
      return {...state, isLoading: false}
    },

    getContacts: (state: InitialCommonApisStateType, _action: PayloadAction<ReducerActionType>) => {
      return {...state, contacts: [], isLoading: true}
    },
    getContactsSuccess: (state: InitialCommonApisStateType, {payload: contacts}: PayloadAction<any>) => {
      return {...state, contacts, isLoading: false, error: null}
    },
    getContactsError: (state: InitialCommonApisStateType, _action: PayloadAction<any>) => {
      return {...state, contacts: [], isLoading: false}
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
