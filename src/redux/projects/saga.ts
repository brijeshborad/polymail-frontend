import {PayloadAction} from "@reduxjs/toolkit";
import {all, fork, put, takeLatest} from "@redux-saga/core/effects";
import ApiService from "@/utils/api.service";
import {AxiosError, AxiosResponse} from "axios";
import {getAllProjects, getAllProjectsError, getAllProjectsSuccess} from "@/redux/projects/action-reducer";

function* getProjects(payload: PayloadAction<any>) {
    try {
        const response: AxiosResponse = yield ApiService.callGet(`projects`, null);
        yield put(getAllProjectsSuccess(response));
    } catch (error: AxiosError | any) {
        yield put(getAllProjectsError(error.response.data));
    }
}

export function* watchGetProjects() {
    yield takeLatest(getAllProjects.type, getProjects);
}

export default function* rootSaga() {
    yield all([
        fork(watchGetProjects),
    ]);
}

