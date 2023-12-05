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
  onlineUsers: {threads: {}, projects: {}},
  activityFeed: [],
  projectRules: []
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

    getActivityFeed: (state: InitialCommonApisStateType, _action: PayloadAction<ReducerActionType>) => {
      return {...state, activityFeed: [], isLoading: true}
    },
    getActivityFeedSuccess: (state: InitialCommonApisStateType, {payload: activityFeed}: PayloadAction<any>) => {
      return {...state, activityFeed, isLoading: false, error: null}
    },
    getActivityFeedError: (state: InitialCommonApisStateType, _action: PayloadAction<any>) => {
      return {...state, activityFeed: [], isLoading: false}
    },

    markActivityAsRead: (state: InitialCommonApisStateType, _action: PayloadAction<ReducerActionType>) => {
      return {...state, isLoading: false}
    },
    markActivityAsReadSuccess: (state: InitialCommonApisStateType, _action: PayloadAction<any>) => {
      return {...state, isLoading: false, error: null}
    },
    markActivityAsReadError: (state: InitialCommonApisStateType, _action: PayloadAction<any>) => {
      return {...state, isLoading: false}
    },

    getAllProjectRules: (state: InitialCommonApisStateType, _action: PayloadAction<ReducerActionType>) => {
      return {...state, isLoading: false}
    },
    getAllProjectRulesSuccess: (state: InitialCommonApisStateType, {payload: projectRules}: PayloadAction<any>) => {
      let values = [...projectRules].map(val => ({...val, id: val._id}));
      return {...state, projectRules: values, isLoading: false, error: null}
    },
    getAllProjectRulesError: (state: InitialCommonApisStateType, _action: PayloadAction<any>) => {
      return {...state, projectRules: [], isLoading: false}
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
  updateCommonState, getActivityFeed, getActivityFeedSuccess, getActivityFeedError,
  markActivityAsRead, markActivityAsReadSuccess, markActivityAsReadError,
  getAllProjectRules, getAllProjectRulesSuccess, getAllProjectRulesError
} = commonApisSlice.actions
export default commonApisSlice.reducer
