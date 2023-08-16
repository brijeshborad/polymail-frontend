import {all, fork, put, takeLatest} from "@redux-saga/core/effects";
import ApiService from "@/utils/api.service";
import {AxiosError, AxiosResponse} from "axios";
import {
    createProjects,
    createProjectsError, createProjectsSuccess,
    getAllProjects,
    getAllProjectsError,
    getAllProjectsSuccess
} from "@/redux/projects/action-reducer";

function* getProjects() {
    try {
        const response: AxiosResponse = yield ApiService.callGet(`projects`, null);
        yield put(getAllProjectsSuccess(response));
    } catch (error: any) {
        error = error as AxiosError;
        yield put(getAllProjectsError(error.response.data));
    }
}

function* addProjects() {
    try {
        const response: AxiosResponse = yield ApiService.callPost(`projects`, null);
        yield put(createProjectsSuccess(response));
    } catch (error: any) {
        error = error as AxiosError;
        yield put(createProjectsError(error.response.data));
    }
}

export function* watchGetProjects() {
    yield takeLatest(getAllProjects.type, getProjects);
}

export function* watchAddProjects() {
    yield takeLatest(createProjects.type, addProjects);
}

export default function* rootSaga() {
    yield all([
        fork(watchGetProjects),
        fork(watchAddProjects),
    ]);
}

