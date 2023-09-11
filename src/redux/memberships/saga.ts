import {PayloadAction} from "@reduxjs/toolkit";
import {AxiosError, AxiosResponse} from "axios";
import ApiService from "@/utils/api.service";
import {all, fork, put, takeLatest} from "@redux-saga/core/effects";
import {
    addItemToGroup,
    addItemToGroupError,
    addItemToGroupSuccess,
    deleteMemberFromProject,
    deleteMemberFromProjectError,
    deleteMemberFromProjectSuccess,
    deleteMemberFromOrganization,
    deleteMemberFromOrganizationSuccess,
    deleteMemberFromOrganizationError,
    deleteMemberShipFromProjectError, deleteMemberShipFromProjectSuccess, deleteMemberShipFromProject
} from "@/redux/memberships/action-reducer";
import {MembershipsRequestBody} from "@/models/memberships";

// Add members to Projects
function* addItemToGroupService({payload}: PayloadAction<MembershipsRequestBody>) {
    try {
        const response: AxiosResponse = yield ApiService.callPost(`memberships`, payload);
        yield put(addItemToGroupSuccess(response));
    } catch (error: any) {
        error = error as AxiosError;
        yield put(addItemToGroupError(error?.response?.data || {code: '400', description: 'Something went wrong'}));
    }
}

// Add Threads to Projects
function* removeMemberFromProject({payload: {id, accountId}}: PayloadAction<{id: string, accountId: string}>) {
    try {
        const response: AxiosResponse = yield ApiService.callDelete(`projects/${id}/accounts/${accountId}`, {});
        yield put(deleteMemberFromProjectSuccess(response));
    } catch (error: any) {
        error = error as AxiosError;
        yield put(deleteMemberFromProjectError(error?.response?.data || {code: '400', description: 'Something went wrong'}));
    }
}

function* removeMemberShipFromProject({payload: {id}}: PayloadAction<{id: string}>) {
    try {
        const response: AxiosResponse = yield ApiService.callDelete(`memberships/${id}`, {});
        yield put(deleteMemberShipFromProjectSuccess(response));
    } catch (error: any) {
        error = error as AxiosError;
        yield put(deleteMemberShipFromProjectError(error?.response?.data || {code: '400', description: 'Something went wrong'}));
    }
}

function* removeMemberFromOrganization({payload: {id, accountId}}: PayloadAction<{id: string, accountId: string}>) {
    try {
        const response: AxiosResponse = yield ApiService.callDelete(`organizations/${id}/accounts/${accountId}`, {});
        yield put(deleteMemberFromOrganizationSuccess(response));
    } catch (error: any) {
        error = error as AxiosError;
        yield put(deleteMemberFromOrganizationError(error?.response?.data || {code: '400', description: 'Something went wrong'}));
    }
}

export function* watchAddItemToGroup() {
    yield takeLatest(addItemToGroup.type, addItemToGroupService);
}

export function* watchDeleteMemberFromProject() {
    yield takeLatest(deleteMemberFromProject.type, removeMemberFromProject);
}

export function* watchDeleteMemberShipFromProject() {
    yield takeLatest(deleteMemberShipFromProject.type, removeMemberShipFromProject);
}

export function* watchDeleteMemberFromOrganization() {
    yield takeLatest(deleteMemberFromOrganization.type, removeMemberFromOrganization);
}

export default function* rootSaga() {
    yield all([
        fork(watchAddItemToGroup),
        fork(watchDeleteMemberFromProject),
        fork(watchDeleteMemberShipFromProject),
        fork(watchDeleteMemberFromOrganization),
    ]);
}
