import {createSlice, current, PayloadAction} from "@reduxjs/toolkit";
import {InitialThreadStateType} from "@/types";
import {Thread} from "@/models";

const initialState: any = {
    threads: [],
    searchThreads: [],
    isLoading: false,
    error: null,
    selectedThread: null,
    updateSuccess: false,
    success: false,
    isThreadSearched: false,
    tabValue: ''
} as InitialThreadStateType

const threadsSlice = createSlice({
    name: 'threads',
    initialState,
    reducers: {
        getAllThreads: (state: InitialThreadStateType, _action: PayloadAction<{ mailbox?: string, project?: string, account?: string, enriched?: boolean, resetState?: boolean, query?: string }>) => {
            return {
                ...state,
                ...(_action.payload.hasOwnProperty('resetState') && _action.payload.resetState ? {threads: []} : {}),
                isLoading: _action.payload.hasOwnProperty('resetState') ? _action.payload.resetState : true,
                error: null,
                success: false
            }
        },
        getAllThreadsSuccess: (state: InitialThreadStateType, {payload: threads}: PayloadAction<any>) => {
            // Sort threads by latestMessage DESC
            threads = (threads || []).sort((a: Thread, b: Thread) => (new Date(b.latestMessage as string).valueOf() - new Date(a.latestMessage as string).valueOf()));
            return {...state, threads, isLoading: false, error: null, success: true}
        },
        getAllThreadsError: (state: InitialThreadStateType, {payload: error}: PayloadAction<{ error: any }>) => {
            return {...state, threads: [], isLoading: false, error, success: false}
        },

        updateThreads: (state: InitialThreadStateType, _action: PayloadAction<{ id?: string, body?: Thread }>) => {
            return {...state, error: null, isLoading: false, updateSuccess: false, success: false}
        },
        updateThreadsSuccess: (state: InitialThreadStateType, {payload: thread}: PayloadAction<{}>) => {
            let currentThreads = [...(current(state).threads || [])] as Thread[];
            let threadData = {...(thread) || {}} as Thread;
            let index1 = currentThreads.findIndex((item: Thread) => item.id === threadData?.id);
            currentThreads[index1] = {
                ...currentThreads[index1],
                mailboxes: [...(threadData.mailboxes ?? [])]
            };
            return {...state, threads: [...currentThreads], error: null, isLoading: false, updateSuccess: true, success: true}
        },
        updateThreadsError: (state: InitialThreadStateType, {payload: error}: PayloadAction<any>) => {
            return {...state, error, isLoading: false, updateSuccess: false, success: false}
        },

        searchThreads: (state: InitialThreadStateType, _action: PayloadAction<{ query?: string }>) => {
            return {  ...state, searchThreads: [], error: null, isLoading: false }
        },
        searchThreadsSuccess: (state: InitialThreadStateType, {payload: searchThreads}: PayloadAction<any>) => {
            return {...state, searchThreads, isLoading: false, error: null}
        },
        searchThreadsError: (state: InitialThreadStateType, {payload: error}: PayloadAction<{ error: any }>) => {
            return {...state, searchThreads: [], isLoading: false, error}
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
    updateThreadsError,
    searchThreads,
    searchThreadsSuccess,
    searchThreadsError
} = threadsSlice.actions
export default threadsSlice.reducer
