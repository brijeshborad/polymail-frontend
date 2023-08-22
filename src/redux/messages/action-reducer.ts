import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import {InitialMessageStateType} from "@/types";
import {MessageDraft} from "@/models";

const initialState: any = {
    messages: [],
    message: null,
    selectedMessage: null,
    messagePart: null,
    messageAttachments: [],
    isLoading: false,
    error: null,
    isCompose: false,
    success: false,
    attachmentUrl: null
} as InitialMessageStateType

const messagesSlice = createSlice({
    name: 'messages',
    initialState,
    reducers: {
        getAllMessages: (state: InitialMessageStateType, _action: PayloadAction<{ thread?: string }>) => {
            return {...state, messages: [], isLoading: true, error: null}
        },
        getAllMessagesSuccess: (state: InitialMessageStateType, {payload: messages}: PayloadAction<{}>) => {
            return {...state, messages, isLoading: false, error: null}
        },
        getAllMessagesError: (state: InitialMessageStateType, {payload: error}: PayloadAction<{ error: any }>) => {
            return {...state, messages: [], isLoading: false, error}
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

        getAttachmentDownloadUrl: (state: InitialMessageStateType, _action: PayloadAction<{ id?: string, attachment?: string }>) => {
            return {...state, error: null, isLoading: false, success: false}
        },
        getAttachmentDownloadUrlSuccess: (state: InitialMessageStateType, {payload: attachmentUrl}: PayloadAction<{}>) => {
            return {...state, attachmentUrl, error: null, isLoading: false, success: true}
        },
        getAttachmentDownloadUrlError: (state: InitialMessageStateType, {payload: error}: PayloadAction<any>) => {
            return {...state, error, isLoading: false, success: false}
        },

        uploadAttachment: (state: InitialMessageStateType, _action: PayloadAction<{ id?: string, file?: File }>) => {
            return {...state, error: null, isLoading: false, success: false}
        },
        uploadAttachmentSuccess: (state: InitialMessageStateType, _action: PayloadAction<{}>) => {
            return {...state, error: null, isLoading: false, success: true}
        },
        uploadAttachmentError: (state: InitialMessageStateType, {payload: error}: PayloadAction<any>) => {
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
    updateMessageState,
    getMessageAttachments,
    getMessageAttachmentsSuccess,
    getMessageAttachmentsError,
    getAttachmentDownloadUrl,
    getAttachmentDownloadUrlSuccess,
    getAttachmentDownloadUrlError,
    uploadAttachment,
    uploadAttachmentSuccess,
    uploadAttachmentError
} = messagesSlice.actions
export default messagesSlice.reducer
