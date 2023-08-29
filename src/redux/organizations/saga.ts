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
    removeOrganization,
    removeOrganizationSuccess,
    removeOrganizationError, editOrganizationSuccess, editOrganizationError, editOrganization
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

function* updateOrganizations({payload: {name, accountId, id}}: PayloadAction<{ name?: string, accountId?: string, id?: string }>) {
    try {
        const response: AxiosResponse = yield ApiService.callPatch(`organizations/${id}`, {name, accountId});
        yield put(editOrganizationSuccess(response));

    } catch (error: any) {
        error = error as AxiosError;
        yield put(editOrganizationError(error.response.data));
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

function* deleteOrganization({payload: {id}}: PayloadAction<{ id: string }>) {
    try {
        const response: AxiosResponse = yield ApiService.callDelete(`organizations/${id}`, {});
        yield put(removeOrganizationSuccess(response));
    } catch (error: any) {
        error = error as AxiosError;
        yield put(removeOrganizationError(error.response.data));
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

export function* watchRemoveOrganization() {
    yield takeLatest(removeOrganization.type, deleteOrganization);
}

export function* watchUpdateOrganization() {
    yield takeLatest(editOrganization.type, updateOrganizations);
}


export default function* rootSaga() {
    yield all([
        fork(watchGetOrganizations),
        fork(watchPostOrganizations),
        fork(watchGetOrganizationMembers),
        fork(watchRemoveOrganization),
        fork(watchUpdateOrganization),
    ]);
}

