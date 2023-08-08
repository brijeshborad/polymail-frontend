import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import {InitialMessageStateType} from "@/types";
// import {MessageRequestBody} from "@/models";
// import {Message, MessageDraft, MessagePart, MessageRequestBody} from "@/models";

const initialState: any = {
    messages: [],
    message: null,
    selectedMessage: null,
    messagePart: null,
    draft: null,
    sendMessage: null,
    isLoading: false,
    error: null,
    isCompose: false,
    success: false
} as InitialMessageStateType

const messagesSlice = createSlice({
    name: 'messages',
    initialState,
    reducers: {
        getAllMessages: (state: InitialMessageStateType, action: PayloadAction<{ thread?: string }>) => {
            return {...state, messages: [], isLoading: true, error: null, action}
        },
        getAllMessagesSuccess: (state: InitialMessageStateType, {payload: messages}: PayloadAction<{}>) => {
            return {...state, messages, isLoading: false, error: null}
        },
        getAllMessagesError: (state: InitialMessageStateType, {payload: error}: PayloadAction<{ error: any }>) => {
            return {...state, messages: [], isLoading: false, error}
        },

        getMessageParts: (state: InitialMessageStateType, action: PayloadAction<{ id: string }>) => {
            return {...state, messagePart: null, isLoading: true, error: null, action}
        },
        getMessagePartsSuccess: (state: InitialMessageStateType, {payload: messagePart}: PayloadAction<{}>) => {
            return {...state, messagePart, isLoading: false, error: null}
        },
        getMessagePartsError: (state: InitialMessageStateType, {payload: error}: PayloadAction<{ error: any }>) => {
            return {...state, messagePart: null, isLoading: false, error}
        },

        createDraft: (state: InitialMessageStateType, action: PayloadAction<{ accountId: string, body: any }>) => {
            return {...state, draft: null, error: null, isLoading: false, action}
        },
        createDraftSuccess: (state: InitialMessageStateType, {payload: draft}: PayloadAction<{}>) => {
            return {...state, draft, error: null, isLoading: false}
        },
        createDraftError: (state: InitialMessageStateType, {payload: error}: PayloadAction<any>) => {
            return {...state, draft: null, error, isLoading: false}
        },

        sendMessage: (state: InitialMessageStateType, action: PayloadAction<{ id: string }>) => {
            return {...state, sendMessage: null, error: null, isLoading: true, action}
        },
        sendMessageSuccess: (state: InitialMessageStateType, {payload: sendMessage}: PayloadAction<{ }>) => {
            return {...state, sendMessage, error: null, isLoading: false, success: true}
        },
        sendMessageError: (state: InitialMessageStateType, {payload: error}: PayloadAction<any>) => {
            return {...state, sendMessage: null, error, isLoading: false}
        },

        updatePartialMessage: (state: InitialMessageStateType, action: PayloadAction<{ id: string, body: any}>) => {
            return {...state, draft: null, error: null, isLoading: false, action}
        },
        updatePartialMessageSuccess: (state: InitialMessageStateType, {payload: draft}: PayloadAction<{}>) => {
            return {...state, draft, error: null, isLoading: false}
        },
        updatePartialMessageError: (state: InitialMessageStateType, {payload: error}: PayloadAction<any>) => {
            return {...state, draft: null, error, isLoading: false}
        },

        updateMessageState: (state: InitialMessageStateType, action: PayloadAction<InitialMessageStateType>) => {
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
    updatePartialMessage,
    updatePartialMessageSuccess,
    updatePartialMessageError,
    updateMessageState
} = messagesSlice.actions
export default messagesSlice.reducer
