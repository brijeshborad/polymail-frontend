import {createSlice, current, PayloadAction} from "@reduxjs/toolkit";
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
        getAllThreads: (state: InitialThreadStateType, _action: PayloadAction<{ mailbox?: string, project?: string, account?: string, enriched?: boolean }>) => {
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
        updateThreadsSuccess: (state: InitialThreadStateType, {payload: thread}: PayloadAction<{}>) => {
            let currentThreads = [...(current(state).threads || [])] as Thread[];
            let threadData = {...(thread) || {}} as Thread;
            let index1 = currentThreads.findIndex((item: Thread) => item.id === threadData?.id);
            currentThreads[index1] = {
                ...currentThreads[index1],
                mailboxes: [...(threadData.mailboxes ?? [])]
            };
            return {...state, threads: [...currentThreads], error: null, isLoading: false, selectedThread: thread}
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
