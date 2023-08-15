import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import {InitialThreadStateType} from "@/types";
import {Thread} from "@/models";
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
        getAllThreads: (state: InitialThreadStateType, _action: PayloadAction<{ mailbox?: string, project?: string, account?: string }>) => {
            return {...state, threads: [], isLoading: true, error: null}
        },
        getAllThreadsSuccess: (state: InitialThreadStateType, {payload: threads}: PayloadAction<{}>) => {
            return {...state, threads, isLoading: false, error: null}
        },
        getAllThreadsError: (state: InitialThreadStateType, {payload: error}: PayloadAction<{ error: any }>) => {
            return {...state, threads: [], isLoading: false, error}
        },

        updateThreads: (state: InitialThreadStateType, _action: PayloadAction<{ id?: string, body?: Thread }>) => {
            return {...state, thread: null, error: null, isLoading: false}
        },
        updateThreadsSuccess: (state: InitialThreadStateType, {payload: thread}: PayloadAction<any>) => {
            let index1 = (state.threads || [])?.findIndex((item: Thread, index: number) => {
                if (thread && thread.id) {
                    if (item.id === thread?.id) {
                        return index
                    }
                }
                return;
            });
            (state.threads || [])[index1] = thread
            // return {...state, thread, error: null, isLoading: false}
        },
        updateThreadsError: (state: InitialThreadStateType, {payload: error}: PayloadAction<any>) => {
            return {...state, thread: null, error, isLoading: false}
        },
        updateThreadState: (state: InitialThreadStateType, action: PayloadAction<InitialThreadStateType>) => {
            return {...state, ...action.payload}
        }
    }
})

export const {
    getAllThreads,
    getAllThreadsSuccess,
    getAllThreadsError,
    updateThreadState,
    updateThreads,
    updateThreadsSuccess,
    updateThreadsError
} = threadsSlice.actions
export default threadsSlice.reducer
