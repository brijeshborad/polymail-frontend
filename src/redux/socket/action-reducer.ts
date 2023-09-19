import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import {InitialSocketType} from "@/types";

const initialState: any = {
    newMessage: null,
    sendJsonMessage: null,
} as InitialSocketType

const socketSlice = createSlice({
    name: 'socket',
    initialState,
    reducers: {
        updateLastMessage: (state: InitialSocketType, {payload: newMessage}: PayloadAction<any | null>) => {
            return {...state, newMessage};
        },
        updateSendFunction: (state: InitialSocketType, {payload: sendJsonMessage}: PayloadAction<any | null>) => {
            return {...state, sendJsonMessage};
        }
    }
})

export const {updateLastMessage, updateSendFunction} = socketSlice.actions
export default socketSlice.reducer
