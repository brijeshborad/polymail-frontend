import {PayloadAction} from "@reduxjs/toolkit";
import {AxiosError, AxiosResponse} from "axios";
import ApiService from "@/utils/api.service";
import {all, fork, put, takeLatest} from "@redux-saga/core/effects";
import {
    addThreadToProject,
    addThreadToProjectSuccess,
    addThreadToProjectError
} from "@/redux/memberships/action-reducer";
import {MembershipsRequestBody} from "@/models/memberships";


function* addThreadToProjectService({payload}: PayloadAction<MembershipsRequestBody>) {
    try {
        const response: AxiosResponse = yield ApiService.callPost(`memberships`, payload);
        yield put(addThreadToProjectSuccess(response));
    } catch (error: any) {
        error = error as AxiosError;
        yield put(addThreadToProjectError(error.response.data));
    }
}

export function* watchAddThreadToProject() {
    yield takeLatest(addThreadToProject.type, addThreadToProjectService);
}

export default function* rootSaga() {
    yield all([
        fork(watchAddThreadToProject)
    ]);
}
