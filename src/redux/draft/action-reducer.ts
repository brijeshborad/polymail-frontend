import {createSlice, current, PayloadAction} from "@reduxjs/toolkit";
import {InitialDraftStateType, ReducerActionType} from "@/types";
import {getDraftStatus} from "@/utils/cache.functions";
import {threadService} from "@/services";

const initialState: any = {
    draft: null,
    composeDraft: null,
    sendMessage: null,
    isLoading: false,
    error: null,
    success: false,
    updatedDraft: null,
    updatedComposeDraft: null,
    resumeAbleDraft: null
} as InitialDraftStateType

const draftSlice = createSlice({
    name: 'draft',
    initialState,
    reducers: {
        createDraft: (state: InitialDraftStateType, {payload}: PayloadAction<ReducerActionType>) => {
            return {...state, ...(payload.body.fromCompose ? {composeDraft: null} : {draft: null}), isLoading: false}
        },
        createDraftSuccess: (state: InitialDraftStateType, {payload: {draft, isForCompose}}: PayloadAction<any>) => {
            return {
                ...state,
                ...(isForCompose ? {composeDraft: draft, updatedComposeDraft: draft} : {draft, updatedDraft: draft}),
                isLoading: false
            }
        },
        createDraftError: (state: InitialDraftStateType, {payload: {isForCompose}}: PayloadAction<any>) => {
            return {...state, ...(isForCompose ? {composeDraft: null} : {draft: null}), isLoading: false}
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
        updatePartialMessageSuccess: (state: InitialDraftStateType, {
            payload: {
                updatedDraft,
                isForCompose,
                isDraftTab
            }
        }: PayloadAction<any>) => {
            let {composeDraft, draft} = current(state);
            let finalUpdates: any = {...(isForCompose ? composeDraft: draft), ...updatedDraft}
            let finalState: any = {}
            if (isForCompose) {
                finalState = {composeDraft: finalUpdates, updatedComposeDraft: finalUpdates, resumeAbleDraft: finalUpdates, success: true};
                if (isDraftTab) {
                    finalState = {...finalState, updatedDraft: finalUpdates}
                }
            } else {
                finalState = {updatedDraft: finalUpdates, success: true}
            }
            if (getDraftStatus()[finalUpdates.id]) {
                delete finalState.composeDraft
                delete finalState.updatedComposeDraft
                delete finalState.resumeAbleDraft
                delete finalState.updatedDraft
                if (!isForCompose) {
                    threadService.pushOrUpdateDraftInThreadMessages('', finalUpdates);
                }
            }
            return {
                ...state,
                ...finalState,
                isLoading: false
            }
        },
        updatePartialMessageError: (state: InitialDraftStateType, _action: PayloadAction<any>) => {
            return {...state, isLoading: false}
        },

        discardDraft: (state: InitialDraftStateType, action: PayloadAction<ReducerActionType>) => {
            return {...state, ...action.payload}
        },

        discardDraftSuccess: (state: InitialDraftStateType, {payload: updatedDraft}: PayloadAction<any>) => {
            return {...state, updatedDraft, success: true}
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
    updateDraftState, discardDraft, discardDraftSuccess
} = draftSlice.actions
export default draftSlice.reducer
