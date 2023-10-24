import {PayloadAction} from "@reduxjs/toolkit";
import {all, fork, put, takeEvery} from "@redux-saga/core/effects";
import ApiService from "@/utils/api.service";
import {AxiosError, AxiosResponse} from "axios";
import {
    getAllThreadsError,
    getAllThreadsSuccess,
    getAllThreads,
    batchUpdateThreads,
    updateThreadsSuccess, updateThreadsError, updateThreads, searchThreadsSuccess, searchThreadsError, searchThreads
} from "@/redux/threads/action-reducer";
import { ReducerActionType } from "@/types";
import { performSuccessActions } from "@/utils/common-redux.functions";

function* getThreads({payload}: PayloadAction<ReducerActionType>) {
    try {
        const response: AxiosResponse = yield ApiService.callGet(`threads`, {
            ...(payload.body.mailbox ? {mailbox: payload.body.mailbox}: {}),
            ...(payload.body.project ? {project: payload.body.project}: {}),
            ...(payload.body.account ? {account: payload.body.account}: {}),
            ...(payload.body.mine ? {mine: payload.body.mine}: {}),
            ...(payload.body.query ? {query: payload.body.query} : {}),
            ...payload.body.pagination
        });
        performSuccessActions(payload);
        yield put(getAllThreadsSuccess({threads: response, pagination: payload.body.pagination}));
    } catch (error: any) {
        error = error as AxiosError;
        yield put(getAllThreadsError(error?.response?.data || {code: '400', description: 'Something went wrong'}));
    }
}

function* patchThreads({payload}: PayloadAction<ReducerActionType>) {
    try {
      const response: AxiosResponse = yield ApiService.callPatch(`threads/${payload.body.id}`, payload.body.body);
        performSuccessActions(payload);
        yield put(updateThreadsSuccess(response));
    } catch (error: any) {
        error = error as AxiosError;
        yield put(updateThreadsError(error?.response?.data || {code: '400', description: 'Something went wrong'}));
    }
}

function* batchThreads({payload}: PayloadAction<ReducerActionType>){
  try {
    const response: AxiosResponse = yield ApiService.callPatch(`batch`, {
        threadIds: payload.body.body.threadIds,
        mailboxes: payload.body.body.mailboxes,
        snooze: payload.body.body.snooze
    })
    performSuccessActions(payload);
    yield put(updateThreadsSuccess(response))
  } catch (error: any) {
    error = error as AxiosError;
    yield put(updateThreadsError(error?.response?.data || {code: '400', description: 'Something went wrong'}));
  }
}

function* searchAndGetThreads({payload}: PayloadAction<ReducerActionType>) {
    try {
        const response: AxiosResponse = yield ApiService.callGet(`search`, {
            ...(payload.body.query ? {query: payload.body.query} : {})
        });
        performSuccessActions(payload);
        yield put(searchThreadsSuccess(response));
    } catch (error: any) {
        error = error as AxiosError;
        yield put(searchThreadsError(error?.response?.data || {code: '400', description: 'Something went wrong'}));
    }
}

export function* watchGetThreads() {
    yield takeEvery(getAllThreads.type, getThreads);
}

export function* watchUpdateThreads() {
    yield takeEvery(updateThreads.type, patchThreads);
}

export function* watchSearchAndGetThreads() {
    yield takeEvery(searchThreads.type, searchAndGetThreads);
  }

  export function* watchBatchUpdateThread() {
    yield takeEvery(batchUpdateThreads.type, batchThreads);
}

export default function* rootSaga() {
    yield all([
        fork(watchGetThreads),
        fork(watchUpdateThreads),
        fork(watchSearchAndGetThreads),
        fork(watchBatchUpdateThread),
    ]);
}

