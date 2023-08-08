import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import {InitialThreadStateType} from "@/types";
// import {Thread} from "@/models";

const initialState: any = {
    threads: [],
    thread: null,
    isLoading: false,
    error: null,
    selectedThread: null,
} as InitialThreadStateType

const threadsSlice = createSlice({
    name: 'threads',
    initialState,
    reducers: {
        getAllThreads: (state: InitialThreadStateType, action: PayloadAction<{ mailbox?: string, project?: string, account?: string }>) => {
            return {...state, threads: [], isLoading: true, error: null, action}
        },
        getAllThreadsSuccess: (state: InitialThreadStateType, {payload: threads}: PayloadAction<{}>) => {
            return {...state, threads, isLoading: false, error: null}
        },
        getAllThreadsError: (state: InitialThreadStateType, {payload: error}: PayloadAction<{ error: any }>) => {
            return {...state, threads: [], isLoading: false, error}
        },
        updateThreadState: (state: InitialThreadStateType, action: PayloadAction<InitialThreadStateType >) => {
            return {...state, ...action.payload}
        }
    }
})

export const {getAllThreads, getAllThreadsSuccess, getAllThreadsError, updateThreadState} = threadsSlice.actions
export default threadsSlice.reducer
