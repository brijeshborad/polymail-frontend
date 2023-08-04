import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import {InitialMessagePartType, InitialMessageStateType} from "@/types";
import {Message} from "@/models";

const initialState = {
    messages: [],
    message : null,
    isLoading: false,
    error: null,
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
        }
    }
})

export const {
    getAllMessages,
    getAllMessagesSuccess,
    getAllMessagesError,
    getMessageParts,
    getMessagePartsSuccess,
    getMessagePartsError
} = messagesSlice.actions
export default messagesSlice.reducer
