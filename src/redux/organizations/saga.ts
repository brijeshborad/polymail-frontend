import {PayloadAction} from "@reduxjs/toolkit";
import {all, fork, put, takeLatest} from "@redux-saga/core/effects";
import ApiService from "@/utils/api.service";
import {AxiosError, AxiosResponse} from "axios";
import {getAllOrganizations, getAllOrganizationsSuccess, getAllOrganizationsError} from "@/redux/organizations/action-reducer";

function* getOrganizations(payload: PayloadAction<any>) {
    try {
        const response: AxiosResponse = yield ApiService.callGet(`organizations`, {});
        yield put(getAllOrganizationsSuccess(response));
    } catch (error: AxiosError | any) {
        yield put(getAllOrganizationsError(error.response.data));
    }
}

export function* watchGetOrganizations() {
    yield takeLatest(getAllOrganizations.type, getOrganizations);
}

export default function* rootSaga() {
    yield all([
        fork(watchGetOrganizations),
    ]);
}

