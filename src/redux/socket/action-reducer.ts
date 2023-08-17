import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import {InitialSocketType} from "@/types";

const initialState: any = {
    newMessage: null,
} as InitialSocketType

const socketSlice = createSlice({
    name: 'socket',
    initialState,
    reducers: {
        updateLastMessage: (state: InitialSocketType, {payload: newMessage}: PayloadAction<{ userId: string, name: string }>) => {
            return {...state, newMessage};
        }
    }
})

export const {updateLastMessage} = socketSlice.actions
export default socketSlice.reducer
