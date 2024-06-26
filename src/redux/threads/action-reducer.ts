import {createSlice, current, PayloadAction} from "@reduxjs/toolkit";
import {InitialThreadStateType, ReducerActionType} from "@/types";
import {Thread} from "@/models";
import {extractAndMapThreadAndMessagesBody} from "@/utils/thread.functions";
import {performSuccessActions} from "@/utils/common-redux.functions";

const initialState: any = {
    threads: [],
    searchThreads: [],
    isLoading: false,
    error: null,
    selectedThread: null,
    updateSuccess: false,
    success: false,
    isThreadSearched: false,
    tabValue: '',
    isThreadFocused: false
} as InitialThreadStateType

const threadsSlice = createSlice({
    name: 'threads',
    initialState,
    reducers: {
        getAllThreads: (state: InitialThreadStateType, _action: PayloadAction<ReducerActionType>) => {
            return {
                ...state,
                ...(_action.payload.hasOwnProperty('resetState') && _action.payload.body.resetState ? {threads: []} : {}),
                isLoading: _action.payload.hasOwnProperty('resetState') ? _action.payload.body.resetState : true,
            }
        },
        getAllThreadsSuccess: (state: InitialThreadStateType, {payload: {threads, fullPayload}}: PayloadAction<any>) => {
            // Sort threads by latestMessage DESC
            let currentThreads = current(state).threads;
            let {tabValue, subTabValue} = current(state);
            let isThreadSearched = current(state).isThreadSearched;
            if (isThreadSearched) {
                return {...state};
            }
            threads = extractAndMapThreadAndMessagesBody(threads, fullPayload.body.pagination, currentThreads, fullPayload.body.mailbox, fullPayload.body.type);
            performSuccessActions(fullPayload, threads);
            let finalState: InitialThreadStateType = {...state, isLoading: false, success: false};
            if (tabValue === fullPayload.body.mailbox && subTabValue === fullPayload.body.type) {
                finalState.threads = threads;
            }
            return {...finalState}
        },
        getAllThreadsError: (state: InitialThreadStateType, _action: PayloadAction<any>) => {
            return {...state, threads: [], isLoading: false}
        },

        updateThreads: (state: InitialThreadStateType, _action: PayloadAction<ReducerActionType>) => {
            return {...state, isLoading: false, updateSuccess: false}
        },
        updateThreadsSuccess: (state: InitialThreadStateType, {payload: thread}: PayloadAction<{}>) => {
            let currentThreads = [...(current(state).threads || [])] as Thread[];
            let threadData = {...(thread) || {}} as Thread;
            let index1 = currentThreads.findIndex((item: Thread) => item.id === threadData?.id);
            currentThreads[index1] = {
                ...currentThreads[index1],
                mailboxes: [...(threadData.mailboxes ?? [])]
            };
            return {...state, threads: [...currentThreads], isLoading: false, updateSuccess: true}
        },
        updateThreadsError: (state: InitialThreadStateType, _action: PayloadAction<any>) => {
            return {...state, isLoading: false, updateSuccess: false}
        },

        searchThreads: (state: InitialThreadStateType, _action: PayloadAction<ReducerActionType>) => {
            return {...state, searchThreads: [], isLoading: false}
        },
        searchThreadsSuccess: (state: InitialThreadStateType, {payload: searchThreads}: PayloadAction<any>) => {
            return {...state, searchThreads, isLoading: false}
        },
        searchThreadsError: (state: InitialThreadStateType, _action: PayloadAction<any>) => {
            return {...state, searchThreads: [], isLoading: false}
        },

        updateThreadState: (state: InitialThreadStateType, action: PayloadAction<InitialThreadStateType>) => {
            return {...state, ...action.payload}
        },

        batchUpdateThreads: (state: InitialThreadStateType, _action: PayloadAction<ReducerActionType>) => {
            return {...state, isLoading: false, updateSuccess: false}
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
    batchUpdateThreads,
    searchThreads,
    searchThreadsSuccess,
    searchThreadsError
} = threadsSlice.actions
export default threadsSlice.reducer
