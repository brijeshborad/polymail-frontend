import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import {InitialMessageStateType} from "@/types";
import {Message, MessageDraft, MessagePart, MessageRequestBody} from "@/models";

const initialState = {
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
            return {...state, messages: [], isLoading: true, error: null}
        },
        getAllMessagesSuccess: (state: InitialMessageStateType, {payload: messages}: PayloadAction<{ messages: Message[] }>) => {
            return {...state, messages, isLoading: false, error: null}
        },
        getAllMessagesError: (state: InitialMessageStateType, {payload: error}: PayloadAction<{ error: any }>) => {
            return {...state, messages: [], isLoading: false, error}
        },

        getMessageParts: (state: InitialMessageStateType, action: PayloadAction<{ id: string }>) => {
            return {...state, messagePart: null, isLoading: true, error: null}
        },
        getMessagePartsSuccess: (state: InitialMessageStateType, {payload: messagePart}: PayloadAction<{ messagePart: MessagePart }>) => {
            return {...state, messagePart, isLoading: false, error: null}
        },
        getMessagePartsError: (state: InitialMessageStateType, {payload: error}: PayloadAction<{ error: any }>) => {
            return {...state, messagePart: null, isLoading: false, error}
        },

        createDraft: (state: InitialMessageStateType, action: PayloadAction<{ id: string }>) => {
            return {...state, draft: null, error: null, isLoading: false}
        },
        createDraftSuccess: (state: InitialMessageStateType, {payload: draft}: PayloadAction<{messageDraft: MessageDraft}>) => {
            return {...state, draft, error: null, isLoading: false}
        },
        createDraftError: (state: InitialMessageStateType, {payload: error}: PayloadAction<any>) => {
            return {...state, draft: null, error, isLoading: false}
        },

        sendMessage: (state: InitialMessageStateType, action: PayloadAction<{ id: string }>) => {
            return {...state, sendMessage: null, error: null, isLoading: true}
        },
        sendMessageSuccess: (state: InitialMessageStateType, {payload: sendMessage}: PayloadAction<{ messages: MessageDraft}>) => {
            return {...state, sendMessage, error: null, isLoading: false, success: true}
        },
        sendMessageError: (state: InitialMessageStateType, {payload: error}: PayloadAction<any>) => {
            return {...state, sendMessage: null, error, isLoading: false}
        },

        updatePartialMessage: (state: InitialMessageStateType, action: PayloadAction<{ id: string, body: MessageRequestBody }>) => {
            return {...state, draft: null, error: null, isLoading: false}
        },
        updatePartialMessageSuccess: (state: InitialMessageStateType, {payload: draft}: PayloadAction<{messageRequestBody: MessageRequestBody}>) => {
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