import {PayloadAction} from "@reduxjs/toolkit";
import {all, fork, put, takeLatest} from "@redux-saga/core/effects";
import ApiService from "@/utils/api.service";
import {AxiosError, AxiosResponse} from "axios";
import {getAllOrganizations, getAllOrganizationsSuccess, getAllOrganizationsError, addOrganization, addOrganizationSuccess, addOrganizationError} from "@/redux/organizations/action-reducer";
import {Organization} from "@/models";

function* getOrganizations(payload: PayloadAction<{organization: Organization}>) {
    try {
        const response: AxiosResponse = yield ApiService.callGet(`organizations`, {});
        yield put(getAllOrganizationsSuccess(response));
    } catch (error: AxiosError | any) {
        yield put(getAllOrganizationsError(error.response.data));
    }
}

function* addOrganizations({payload: {name, accountId}}: PayloadAction<{organization: Organization}>) {
    try {
        const response: AxiosResponse = yield ApiService.callPost(`organizations`, {name, accountId});
        yield put(addOrganizationSuccess(response));
    } catch (error: AxiosError | any) {
        yield put(addOrganizationError(error.response.data));
    }
}

export function* watchGetOrganizations() {
    yield takeLatest(getAllOrganizations.type, getOrganizations);
}

export function* watchPostOrganizations() {
    yield takeLatest(addOrganization.type, addOrganizations);
}

export default function* rootSaga() {
    yield all([
        fork(watchGetOrganizations),
        fork(watchPostOrganizations),
    ]);
}

