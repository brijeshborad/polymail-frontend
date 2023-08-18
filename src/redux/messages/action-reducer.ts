import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import {InitialMessageStateType} from "@/types";
import {MessageDraft} from "@/models";

const initialState: any = {
    messages: [],
    message: null,
    selectedMessage: null,
    messagePart: null,
    messageAttachments: [],
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
        getAllMessages: (state: InitialMessageStateType, _action: PayloadAction<{ thread?: string }>) => {
            return {...state, messages: [], isLoading: true, error: null, draft:null}
        },
        getAllMessagesSuccess: (state: InitialMessageStateType, {payload: messages}: PayloadAction<{}>) => {
            return {...state, messages, isLoading: false, error: null, draft:null}
        },
        getAllMessagesError: (state: InitialMessageStateType, {payload: error}: PayloadAction<{ error: any }>) => {
            return {...state, messages: [], isLoading: false, error, draft:null}
        },

        getMessageParts: (state: InitialMessageStateType, _action: PayloadAction<{ id: string }>) => {
            return {...state, messagePart: null, isLoading: true, error: null}
        },
        getMessagePartsSuccess: (state: InitialMessageStateType, {payload: messagePart}: PayloadAction<{}>) => {
            return {...state, messagePart, isLoading: false, error: null}
        },
        getMessagePartsError: (state: InitialMessageStateType, {payload: error}: PayloadAction<{ error: any }>) => {
            return {...state, messagePart: null, isLoading: false, error}
        },

        getMessageAttachments: (state: InitialMessageStateType, _action: PayloadAction<{ id: string }>) => {
            return {...state, messageAttachments: null, isLoading: true, error: null}
        },
        getMessageAttachmentsSuccess: (state: InitialMessageStateType, {payload: messageAttachments}: PayloadAction<{}>) => {
            return {...state, messageAttachments, isLoading: false, error: null}
        },
        getMessageAttachmentsError: (state: InitialMessageStateType, {payload: error}: PayloadAction<{ error: any }>) => {
            return {...state, messageAttachments: null, isLoading: false, error}
        },

        createDraft: (state: InitialMessageStateType, _action: PayloadAction<{ accountId: string, body: MessageDraft }>) => {
            return {...state, draft: null, error: null, isLoading: false}
        },
        createDraftSuccess: (state: InitialMessageStateType, {payload: draft}: PayloadAction<{}>) => {
            return {...state, draft, error: null, isLoading: false}
        },
        createDraftError: (state: InitialMessageStateType, {payload: error}: PayloadAction<any>) => {
            return {...state, draft: null, error, isLoading: false}
        },

        sendMessage: (state: InitialMessageStateType, _action: PayloadAction<{ id: string, now?: boolean, delay?: number, undo?: boolean }>) => {
            return {...state, sendMessage: null, error: null, isLoading: true}
        },
        sendMessageSuccess: (state: InitialMessageStateType, {payload: sendMessage}: PayloadAction<{}>) => {
            return {...state, sendMessage, error: null, isLoading: false, success: true}
        },
        sendMessageError: (state: InitialMessageStateType, {payload: error}: PayloadAction<any>) => {
            return {...state, sendMessage: null, error, isLoading: false}
        },

        updatePartialMessage: (state: InitialMessageStateType, _action: PayloadAction<{ id: string, body: MessageDraft}>) => {
            return {...state, message: null, error: null, isLoading: false}
        },
        updatePartialMessageSuccess: (state: InitialMessageStateType, {payload: message}: PayloadAction<{}>) => {
            return {...state, message, error: null, isLoading: false}
        },
        updatePartialMessageError: (state: InitialMessageStateType, {payload: error}: PayloadAction<any>) => {
            return {...state, message: null, error, isLoading: false}
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
    updateMessageState,
    getMessageAttachments,
    getMessageAttachmentsSuccess,
    getMessageAttachmentsError
} = messagesSlice.actions
export default messagesSlice.reducer
