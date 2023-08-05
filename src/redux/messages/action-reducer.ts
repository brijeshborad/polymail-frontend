import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import {InitialMessageStateType} from "@/types";
import {Message} from "@/models";

const initialState = {
    messages: [],
    message : null,
    draft: null,
    sendMessage: null,
    isLoading: false,
    error: null,
    isCompose: false
} as InitialMessageStateType

const messagesSlice = createSlice({
    name: 'messages',
    initialState,
    reducers: {
        getAllMessages: (state: InitialMessageStateType, action: PayloadAction<{ thread?: string }>) => {
            return {...state, messages: [], isLoading: true, error: null}
        },
        getAllMessagesSuccess: (state: InitialMessageStateType, {payload: messages}: PayloadAction<{ messages: Message[] }>) => {
            return {...state, messages, isLoading: false, error: null}
        },
        getAllMessagesError: (state: InitialMessageStateType, {payload: error}: PayloadAction<{ error: any }>) => {
            return {...state, messages: [], isLoading: false, error}
        },
        getMessageParts: (state: InitialMessageStateType, action: PayloadAction<{ id: string }>) => {
            return {...state, message: null, isLoading: true, error: null}
        },
        getMessagePartsSuccess: (state: InitialMessageStateType, {payload: message}: PayloadAction<{ message: any }>) => {
            return {...state, message, isLoading: false, error: null}
        },
        getMessagePartsError: (state: InitialMessageStateType, {payload: error}: PayloadAction<{ error: any }>) => {
            return {...state, messages: null, isLoading: false, error}
        },
        createDraft: (state: InitialMessageStateType, action: PayloadAction<{ id: string}>) => {
            return {...state, draft: null, error: null, isLoading: true}
        },
        createDraftSuccess: (state: InitialMessageStateType, {payload: draft}: PayloadAction<any>) => {
            return {...state, draft, error: null, isLoading: false}
        },
        createDraftError: (state: InitialMessageStateType, {payload: error}: PayloadAction<any>) => {
            return {...state, draft: null, error, isLoading: false}
        },
        sendMessage: (state: InitialMessageStateType, action: PayloadAction<{ id: string}>) => {
            return {...state, sendMessage: null, error: null, isLoading: true}
        },
        sendMessageSuccess: (state: InitialMessageStateType, {payload: sendMessage}: PayloadAction<any>) => {
            return {...state, sendMessage, error: null, isLoading: false}
        },
        sendMessageError: (state: InitialMessageStateType, {payload: error}: PayloadAction<any>) => {
            return {...state, sendMessage: null, error, isLoading: false}
        },
        updateDraft: (state: InitialMessageStateType, action: PayloadAction<{ id: string, body: object}>) => {
            return {...state, draft: null, error: null, isLoading: true}
        },
        updateDraftSuccess: (state: InitialMessageStateType, {payload: draft}: PayloadAction<any>) => {
            return {...state, draft, error: null, isLoading: false}
        },
        updateDraftError: (state: InitialMessageStateType, {payload: error}: PayloadAction<any>) => {
            return {...state, draft: null, error, isLoading: false}
        },
        updateCurrentDraft: (state: InitialMessageStateType, action: PayloadAction<{ id: string, body: object}>) => {
            return {...state, draft: null, error: null, isLoading: true}
        },
        updateCurrentDraftSuccess: (state: InitialMessageStateType, {payload: draft}: PayloadAction<any>) => {
            return {...state, draft, error: null, isLoading: false}
        },
        updateCurrentDraftError: (state: InitialMessageStateType, {payload: error}: PayloadAction<any>) => {
            return {...state, draft: null, error, isLoading: false}
        },
        updateMessageState: (state: InitialMessageStateType, action: PayloadAction<any>) => {
            return {...state, ...action.payload}
        },
    }
})

export const {
    getAllMessages,
    getAllMessagesSuccess,
    getAllMessagesError,
    getMessageParts,
    getMessagePartsSuccess,
    getMessagePartsError,
    createDraft,
    createDraftSuccess,
    createDraftError,
    sendMessage,
    sendMessageSuccess,
    sendMessageError,
    updateDraft,
    updateDraftSuccess,
    updateDraftError,
    updateCurrentDraft,
    updateCurrentDraftSuccess,
    updateCurrentDraftError,
    updateMessageState
} = messagesSlice.actions
export default messagesSlice.reducer
