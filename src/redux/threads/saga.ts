import {PayloadAction} from "@reduxjs/toolkit";
import {all, fork, put, takeLatest} from "@redux-saga/core/effects";
import ApiService from "@/utils/api.service";
import {AxiosError, AxiosResponse} from "axios";
import {getAllThreadsError, getAllThreadsSuccess, getAllThreads} from "@/redux/threads/action-reducer";

function* getThreads({
                         payload: {
                             mailbox,
                             project,
                             account
                         }
                     }: PayloadAction<{ mailbox?: string, project?: string, account?: string }>) {
    try {
        const response: AxiosResponse = yield ApiService.callGet(`threads`, {
            ...(mailbox ? {mailbox}: {}),
            ...(project ? {project}: {}),
            ...(account ? {account}: {}),
        });
        yield put(getAllThreadsSuccess(response));
    } catch (error: any) {
        error = error as AxiosError;
        yield put(getAllThreadsError(error.response.data));
    }
}

export function* watchGetThreads() {
    yield takeLatest(getAllThreads.type, getThreads);
}

export default function* rootSaga() {
    yield all([
        fork(watchGetThreads),
    ]);
}

