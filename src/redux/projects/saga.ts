import {PayloadAction} from "@reduxjs/toolkit";
import {all, fork, put, takeLatest} from "@redux-saga/core/effects";
import ApiService from "@/utils/api.service";
import {AxiosError, AxiosResponse} from "axios";
import {getAllProjects, getAllProjectsError, getAllProjectsSuccess} from "@/redux/projects/action-reducer";
import {Project} from "@/models";

function* getProjects(payload: PayloadAction<{projects: Project}>) {
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

