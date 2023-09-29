import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import {InitialDraftStateType, ReducerActionType} from "@/types";

const initialState: any = {
    draft: null,
    sendMessage: null,
    isLoading: false,
    error: null,
    success: false,
    updatedDraft: null
} as InitialDraftStateType

const draftSlice = createSlice({
    name: 'draft',
    initialState,
    reducers: {
        createDraft: (state: InitialDraftStateType, _action: PayloadAction<ReducerActionType>) => {
            return {...state, draft: null, isLoading: false}
        },
        createDraftSuccess: (state: InitialDraftStateType, {payload: draft}: PayloadAction<{}>) => {
            return {...state, draft, updatedDraft: draft, isLoading: false}
        },
        createDraftError: (state: InitialDraftStateType, _action: PayloadAction<any>) => {
            return {...state, draft: null, isLoading: false}
        },

        sendMessage: (state: InitialDraftStateType, _action: PayloadAction<ReducerActionType>) => {
            return {...state, sendMessage: null, isLoading: true}
        },
        sendMessageSuccess: (state: InitialDraftStateType, {payload: sendMessage}: PayloadAction<{}>) => {
            return {...state, sendMessage, isLoading: false}
        },
        sendMessageError: (state: InitialDraftStateType, _action: PayloadAction<any>) => {
            return {...state, sendMessage: null, isLoading: false}
        },

        updatePartialMessage: (state: InitialDraftStateType, _action: PayloadAction<ReducerActionType>) => {
            return {...state, isLoading: false}
        },
        updatePartialMessageSuccess: (state: InitialDraftStateType, {payload: updatedDraft}: PayloadAction<{}>) => {
            return {...state, updatedDraft, draft: updatedDraft, isLoading: false}
        },
        updatePartialMessageError: (state: InitialDraftStateType, _action: PayloadAction<any>) => {
            return {...state, isLoading: false}
        },

        updateDraftState: (state: InitialDraftStateType, action: PayloadAction<InitialDraftStateType>) => {
            return {...state, ...action.payload}
        },
    }
})

export const {
    createDraft,
    createDraftSuccess,
    createDraftError,
    sendMessage,
    sendMessageSuccess,
    sendMessageError,
    updatePartialMessage,
    updatePartialMessageSuccess,
    updatePartialMessageError,
    updateDraftState
} = draftSlice.actions
export default draftSlice.reducer
