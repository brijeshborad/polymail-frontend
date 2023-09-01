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
        }
    }
})

export const {updateLastMessage} = socketSlice.actions
export default socketSlice.reducer
