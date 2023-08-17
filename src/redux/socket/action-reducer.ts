import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import {InitialSocketType} from "@/types";

const initialState: any = {
    newMessage: null,
} as InitialSocketType

const socketSlice = createSlice({
    name: 'socket',
    initialState,
    reducers: {
        updateLastMessage: (state: InitialSocketType, action: PayloadAction<{ userId: string, name: string }>) => {
            console.log(action.payload)
            return {...state, newMessage: action.payload};
        }
    }
})

export const {updateLastMessage} = socketSlice.actions
export default socketSlice.reducer
