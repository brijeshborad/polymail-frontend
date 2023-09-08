import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import {InitialDraftStateType} from "@/types";
import {MessageDraft} from "@/models";

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
        createDraft: (state: InitialDraftStateType, _action: PayloadAction<{ accountId: string, body: MessageDraft }>) => {
            return {...state, draft: null, error: null, isLoading: false, success: false}
        },
        createDraftSuccess: (state: InitialDraftStateType, {payload: draft}: PayloadAction<{}>) => {
            return {...state, draft, updatedDraft: draft, error: null, isLoading: false, success: true}
        },
        createDraftError: (state: InitialDraftStateType, {payload: error}: PayloadAction<any>) => {
            return {...state, draft: null, error, isLoading: false, success: false}
        },

        sendMessage: (state: InitialDraftStateType, _action: PayloadAction<{ id: string, now?: boolean, delay?: number, undo?: boolean }>) => {
            return {...state, sendMessage: null, error: null, isLoading: true}
        },
        sendMessageSuccess: (state: InitialDraftStateType, {payload: sendMessage}: PayloadAction<{}>) => {
            return {...state, sendMessage, error: null, isLoading: false}
        },
        sendMessageError: (state: InitialDraftStateType, {payload: error}: PayloadAction<any>) => {
            return {...state, sendMessage: null, error, isLoading: false}
        },

        updatePartialMessage: (state: InitialDraftStateType, _action: PayloadAction<{ id: string, body: MessageDraft }>) => {
            return {...state, error: null, isLoading: false, success: false}
        },
        updatePartialMessageSuccess: (state: InitialDraftStateType, {payload: updatedDraft}: PayloadAction<{}>) => {
            return {...state, updatedDraft, draft: updatedDraft, error: null, isLoading: false, success: true}
        },
        updatePartialMessageError: (state: InitialDraftStateType, {payload: error}: PayloadAction<any>) => {
            return {...state, error, isLoading: false, success: false}
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
