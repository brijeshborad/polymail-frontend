import {PayloadAction} from "@reduxjs/toolkit";
import {all, fork, put, takeLatest} from "@redux-saga/core/effects";
import ApiService from "@/utils/api.service";
import {AxiosError, AxiosResponse} from "axios";
import {getAllThreadsError, getAllThreadsSuccess, getAllThreads} from "@/redux/threads/action-reducer";

function* getThreads({
                         payload: {
                             mailBox,
                             project,
                             account
                         }
                     }: PayloadAction<{ mailBox?: string, project?: string, account?: string }>) {
    try {
        const response: AxiosResponse = yield ApiService.callGet(`threads`, {
            ...(mailBox ? {mailBox}: {}),
            ...(project ? {project}: {}),
            ...(account ? {account}: {}),
        });
        yield put(getAllThreadsSuccess(response));
    } catch (error: AxiosError | any) {
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

