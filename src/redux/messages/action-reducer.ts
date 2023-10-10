import {createSlice, current, PayloadAction} from "@reduxjs/toolkit";
import {InitialMessageStateType, ReducerActionType} from "@/types";
import {Message} from "@/models";

const initialState: any = {
    messages: [],
    message: null,
    selectedMessage: null,
    messagePart: null,
    messageAttachments: [],
    isLoading: false,
    attachmentUrl: null,
    error: null,
    showMessageBox: true,
} as InitialMessageStateType

const messagesSlice = createSlice({
    name: 'messages',
    initialState,
    reducers: {
        getAllMessages: (state: InitialMessageStateType, _action: PayloadAction<ReducerActionType>) => {
            return {...state, messages: [], isLoading: true,}
        },
        getAllMessagesSuccess: (state: InitialMessageStateType, {payload: messages}: PayloadAction<{}>) => {
            return {...state, messages, isLoading: false,}
        },
        getAllMessagesError: (state: InitialMessageStateType,  _action: PayloadAction<any>) => {
            return {...state, messages: [], isLoading: false}
        },

        getMessageParts: (state: InitialMessageStateType, _action: PayloadAction<ReducerActionType>) => {
            return {...state, messagePart: null, isLoading: true}
        },
        getMessagePartsSuccess: (state: InitialMessageStateType, {payload: messagePart}: PayloadAction<{}>) => {
            return {...state, messagePart, isLoading: false}
        },
        getMessagePartsError: (state: InitialMessageStateType,  _action: PayloadAction<any>) => {
            return {...state, messagePart: null, isLoading: false}
        },

        getMessageAttachments: (state: InitialMessageStateType, _action: PayloadAction<ReducerActionType>) => {
            return {...state, messageAttachments: null, isLoading: true}
        },
        getMessageAttachmentsSuccess: (state: InitialMessageStateType, {payload: messageAttachments}: PayloadAction<{}>) => {
            return {...state, messageAttachments, isLoading: false}
        },
        getMessageAttachmentsError: (state: InitialMessageStateType,  _action: PayloadAction<any>) => {
            return {...state, messageAttachments: null, isLoading: false}
        },

        getAttachmentDownloadUrl: (state: InitialMessageStateType, _action: PayloadAction<ReducerActionType>) => {
            return {...state, isLoading: false}
        },
        getAttachmentDownloadUrlSuccess: (state: InitialMessageStateType, {payload: attachmentUrl}: PayloadAction<{}>) => {
            return {...state, attachmentUrl, isLoading: false}
        },
        getAttachmentDownloadUrlError: (state: InitialMessageStateType,  _action: PayloadAction<any>) => {
            return {...state, isLoading: false}
        },

        uploadAttachment: (state: InitialMessageStateType, _action: PayloadAction<ReducerActionType>) => {
            return {...state, isLoading: false}
        },
        uploadAttachmentSuccess: (state: InitialMessageStateType, _action: PayloadAction<{}>) => {
            return {...state, isLoading: false}
        },
        uploadAttachmentError: (state: InitialMessageStateType,  _action: PayloadAction<any>) => {
            return {...state, isLoading: false}
        },

        updateMessage: (state: InitialMessageStateType, _action: PayloadAction<ReducerActionType>) => {
            return {...state, isLoading: false, error: null}
        },
        updateMessageSuccess: (state: InitialMessageStateType, {payload: message}: PayloadAction<{}>) => {
            let currentMessages = [...(current(state).messages || [])] as Message[];
            let messageData = {...(message) || {}} as Message;
            let index1 = currentMessages.findIndex((item: Message) => item.id === messageData?.id);
            currentMessages[index1] = {
                ...currentMessages[index1],
                scope: messageData.scope || 'visible'
            };
            return {...state, messages: [...currentMessages], isLoading: false, error: null}
        },
        updateMessageError: (state: InitialMessageStateType, {payload: error}: PayloadAction<any>) => {
            return {...state, isLoading: false, error}
        },

        deleteMessage: (state: InitialMessageStateType, _action: PayloadAction<ReducerActionType>) => {
            return {...state, isLoading: false}
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
    uploadAttachmentError,
    updateMessage,
    updateMessageSuccess,
    updateMessageError, deleteMessage
} = messagesSlice.actions
export default messagesSlice.reducer
