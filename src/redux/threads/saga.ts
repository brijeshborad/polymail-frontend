import {PayloadAction} from "@reduxjs/toolkit";
import {all, fork, put, takeLatest} from "@redux-saga/core/effects";
import ApiService from "@/utils/api.service";
import {AxiosError, AxiosResponse} from "axios";
import {
    getAllThreadsError,
    getAllThreadsSuccess,
    getAllThreads,
    updateThreadsSuccess, updateThreadsError, updateThreads, searchThreadsSuccess, searchThreadsError, searchThreads
} from "@/redux/threads/action-reducer";
import {ThreadsRequestBody} from "@/models";

function* getThreads({
                         payload: {
                             mailbox,
                             project,
                             account,
                             enriched,
                             query
                         }
                     }: PayloadAction<{ mailbox?: string, project?: string, account?: string, enriched?: boolean, query?: string }>) {
    try {
        const response: AxiosResponse = yield ApiService.callGet(`threads`, {
            ...(mailbox ? {mailbox}: {}),
            ...(project ? {project}: {}),
            ...(account ? {account}: {}),
            ...(enriched ? {enriched}: {}),
            ...(query ? {query} : {})
        });
        yield put(getAllThreadsSuccess(response));
    } catch (error: any) {
        error = error as AxiosError;
        yield put(getAllThreadsError(error.response.data));
    }
}

function* patchThreads({payload: {id, body}}: PayloadAction<{ id: string, body: ThreadsRequestBody }>) {
    try {
        const response: AxiosResponse = yield ApiService.callPatch(`threads/${id}`, body);
        yield put(updateThreadsSuccess(response));
    } catch (error: any) {
        error = error as AxiosError;
        yield put(updateThreadsError(error?.response?.data || {code: '400', description: 'Something went wrong'}));
    }
}

function* searchAndGetThreads({
                         payload: {
                             query
                         }
                     }: PayloadAction<{  query?: string }>) {
    try {
        const response: AxiosResponse = yield ApiService.callGet(`search`, {
            ...(query ? {query} : {})
        });
        yield put(searchThreadsSuccess(response));
    } catch (error: any) {
        error = error as AxiosError;
        yield put(searchThreadsError(error.response.data));
    }
}

export function* watchGetThreads() {
    yield takeLatest(getAllThreads.type, getThreads);
}

export function* watchUpdateThreads() {
    yield takeLatest(updateThreads.type, patchThreads);
}

export function* watchSearchAndGetThreads() {
    yield takeLatest(searchThreads.type, searchAndGetThreads);
}

export default function* rootSaga() {
    yield all([
        fork(watchGetThreads),
        fork(watchUpdateThreads),
        fork(watchSearchAndGetThreads),
    ]);
}

