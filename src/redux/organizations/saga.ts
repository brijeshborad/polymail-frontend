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
    removeOrganizationError,
    editOrganizationSuccess,
    editOrganizationError,
    editOrganization,
    updateOrganizationMemberRoleError, updateOrganizationMemberRoleSuccess, updateOrganizationMemberRole
} from "@/redux/organizations/action-reducer";
import {OrganizationRequestBody} from "@/models";

function* getOrganizations() {
    try {
        const response: AxiosResponse = yield ApiService.callGet(`organizations`, {});
        yield put(getAllOrganizationsSuccess(response));
    } catch (error: any) {
        error = error as AxiosError;
        yield put(getAllOrganizationsError(error?.response?.data || {code: '400', description: 'Something went wrong'}));
    }
}

function* addOrganizations({payload: {name, accountId}}: PayloadAction<{ name: string, accountId: string }>) {
    try {
        const response: AxiosResponse = yield ApiService.callPost(`organizations`, {name, accountId});
        yield put(addOrganizationSuccess(response));
    } catch (error: any) {
        error = error as AxiosError;
        yield put(addOrganizationError(error?.response?.data || {code: '400', description: 'Something went wrong'}));
    }
}

function* updateOrganizations({payload: {preferences, id}}: PayloadAction<{ preferences?: OrganizationRequestBody, id?: string }>) {
    try {
        const response: AxiosResponse = yield ApiService.callPatch(`organizations/${id}`, {preferences});
        yield put(editOrganizationSuccess(response));

    } catch (error: any) {
        error = error as AxiosError;
        yield put(editOrganizationError(error?.response?.data || {code: '400', description: 'Something went wrong'}));
    }
}


function* getOrganizationMembersService({payload: {orgId}}: PayloadAction<{ orgId: string }>) {
    try {
        const response: AxiosResponse = yield ApiService.callGet(`organizations/${orgId}/accounts`, {});
        yield put(getOrganizationMembersSuccess(response));
    } catch (error: any) {
        error = error as AxiosError;
        yield put(getOrganizationMembersError(error?.response?.data || {code: '400', description: 'Something went wrong'}));
    }
}

function* deleteOrganization({payload: {id}}: PayloadAction<{ id: string }>) {
    try {
        const response: AxiosResponse = yield ApiService.callDelete(`organizations/${id}`, {});
        yield put(removeOrganizationSuccess(response));
    } catch (error: any) {
        error = error as AxiosError;
        yield put(removeOrganizationError(error?.response?.data || {code: '400', description: 'Something went wrong'}));
    }
}

function* updateOrganizationMembersData({payload: {organizationId, accountId, body}}: PayloadAction<{organizationId: string, accountId: string, body: {role: string}}>) {
    try {
        const response: AxiosResponse = yield ApiService.callPatch(`organizations/${organizationId}/accounts/${accountId}`, body);
        yield put(updateOrganizationMemberRoleSuccess(response));
    } catch (error: any) {
        error = error as AxiosError;
        yield put(updateOrganizationMemberRoleError(error?.response?.data || {code: '400', description: 'Something went wrong'}));
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


export function* watchUpdateProjectMembersData() {
    yield takeLatest(updateOrganizationMemberRole.type, updateOrganizationMembersData);
}


export default function* rootSaga() {
    yield all([
        fork(watchGetOrganizations),
        fork(watchPostOrganizations),
        fork(watchGetOrganizationMembers),
        fork(watchRemoveOrganization),
        fork(watchUpdateOrganization),
        fork(watchUpdateProjectMembersData),
    ]);
}

