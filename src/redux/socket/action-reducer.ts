import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import {InitialSocketType} from "@/types";

const initialState: any = {
    newMessage: null,
} as InitialSocketType

const socketSlice = createSlice({
    name: 'socket',
    initialState,
    reducers: {
        updateLastMessage: (state: InitialSocketType, {payload: newMessage}: PayloadAction<any | null>) => {
            return {newMessage};
        },
        sendNewMessage: (_state: InitialSocketType, _action: PayloadAction<string>) => {
            return {newMessage: null};
        }
    }
})

export const {updateLastMessage, sendNewMessage} = socketSlice.actions
export default socketSlice.reducer
