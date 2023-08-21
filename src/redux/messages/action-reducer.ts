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
    success: false,
    draftSuccess: false,
    imageUrl: null
} as InitialMessageStateType

const messagesSlice = createSlice({
    name: 'messages',
    initialState,
    reducers: {
        getAllMessages: (state: InitialMessageStateType, _action: PayloadAction<{ thread?: string }>) => {
            return {...state, messages: [], isLoading: true, error: null, draft: null}
        },
        getAllMessagesSuccess: (state: InitialMessageStateType, {payload: messages}: PayloadAction<{}>) => {
            return {...state, messages, isLoading: false, error: null, draft: null}
        },
        getAllMessagesError: (state: InitialMessageStateType, {payload: error}: PayloadAction<{ error: any }>) => {
            return {...state, messages: [], isLoading: false, error, draft: null}
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
            return {...state, draft: null, error: null, isLoading: false, draftSuccess: false}
        },
        createDraftSuccess: (state: InitialMessageStateType, {payload: draft}: PayloadAction<{}>) => {
            return {...state, draft, error: null, isLoading: false, draftSuccess: true}
        },
        createDraftError: (state: InitialMessageStateType, {payload: error}: PayloadAction<any>) => {
            return {...state, draft: null, error, isLoading: false, draftSuccess: false}
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

        updatePartialMessage: (state: InitialMessageStateType, _action: PayloadAction<{ id: string, body: MessageDraft }>) => {
            return {...state, error: null, isLoading: false, draftSuccess: false}
        },
        updatePartialMessageSuccess: (state: InitialMessageStateType, {payload: draft}: PayloadAction<{}>) => {
            return {...state, draft, error: null, isLoading: false, draftSuccess: true}
        },
        updatePartialMessageError: (state: InitialMessageStateType, {payload: error}: PayloadAction<any>) => {
            return {...state, error, isLoading: false, draftSuccess: false}
        },

        getImageUrl: (state: InitialMessageStateType, _action: PayloadAction<{ id?: string, attachment?: string }>) => {
            return {...state, error: null, isLoading: false, success: false}
        },
        getImageUrlSuccess: (state: InitialMessageStateType, {payload: imageUrl}: PayloadAction<{}>) => {
            return {...state, imageUrl, error: null, isLoading: false, success: true}
        },
        getImageUrlError: (state: InitialMessageStateType, {payload: error}: PayloadAction<any>) => {
            return {...state, error, isLoading: false, success: false}
        },

        AddImageUrl: (state: InitialMessageStateType, _action: PayloadAction<{
            id?: string,
                filename?: string,
                mimeType?: string

        }>) => {
            return {...state, error: null, isLoading: false, success: false}
        },
        AddImageUrlSuccess: (state: InitialMessageStateType, {payload: addImageUrl}: PayloadAction<{}>) => {
            return {...state, addImageUrl, error: null, isLoading: false, success: true}
        },
        AddImageUrlError: (state: InitialMessageStateType, {payload: error}: PayloadAction<any>) => {
            return {...state, error, isLoading: false, success: false}
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
    getMessageAttachmentsError,
    getImageUrl,
    getImageUrlSuccess,
    getImageUrlError,
    AddImageUrl,
    AddImageUrlSuccess,
    AddImageUrlError
} = messagesSlice.actions
export default messagesSlice.reducer
