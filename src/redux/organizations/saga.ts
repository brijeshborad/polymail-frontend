import {PayloadAction} from "@reduxjs/toolkit";
import {all, fork, put, takeLatest} from "@redux-saga/core/effects";
import ApiService from "@/utils/api.service";
import {AxiosError, AxiosResponse} from "axios";
import {
    addOrganization,
    addOrganizationError,
    addOrganizationSuccess,
    getAllOrganizations,
    getAllOrganizationsError,
    getAllOrganizationsSuccess,
    getOrganizationMembers,
    getOrganizationMembersSuccess,
    getOrganizationMembersError,
} from "@/redux/organizations/action-reducer";

// import {Organization} from "@/models";

function* getOrganizations() {
    try {
        const response: AxiosResponse = yield ApiService.callGet(`organizations`, {});
        yield put(getAllOrganizationsSuccess(response));
    } catch (error: any) {
        error = error as AxiosError;
        yield put(getAllOrganizationsError(error.response.data));
    }
}

function* addOrganizations({payload: {name, accountId}}: PayloadAction<{ name: string, accountId: string }>) {
    try {
        const response: AxiosResponse = yield ApiService.callPost(`organizations`, {name, accountId});
        yield put(addOrganizationSuccess(response));
    } catch (error: any) {
        error = error as AxiosError;
        yield put(addOrganizationError(error.response.data));
    }
}


function* getOrganizationMembersService({payload: {orgId}}: PayloadAction<{ orgId: string }>) {
    try {
        const response: AxiosResponse = yield ApiService.callGet(`organizations/${orgId}/accounts`, {});
        yield put(getOrganizationMembersSuccess(response));
    } catch (error: any) {
        error = error as AxiosError;
        yield put(getOrganizationMembersError(error.response.data));
    }
}


export function* watchGetOrganizations() {
    yield takeLatest(getAllOrganizations.type, getOrganizations);
}


export function* watchPostOrganizations() {
    yield takeLatest(addOrganization.type, addOrganizations);
}


export function* watchGetOrganizationMembers() {
    yield takeLatest(getOrganizationMembers.type, getOrganizationMembersService);
}


export default function* rootSaga() {
    yield all([
        fork(watchGetOrganizations),
        fork(watchPostOrganizations),
        fork(watchGetOrganizationMembers),
    ]);
}

