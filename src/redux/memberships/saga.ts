import {PayloadAction} from "@reduxjs/toolkit";
import {AxiosError, AxiosResponse} from "axios";
import ApiService from "@/utils/api.service";
import {all, fork, put, takeEvery} from "@redux-saga/core/effects";
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
    deleteMembershipFromProjectError, deleteMembershipFromProjectSuccess, deleteMembershipFromProject
} from "@/redux/memberships/action-reducer";
import { ReducerActionType } from "@/types";
import { performSuccessActions } from "@/utils/common-redux.functions";

// Add members to Projects
function* addItemToGroupService({payload}: PayloadAction<ReducerActionType>) {
    try {
        const response: AxiosResponse = yield ApiService.callPost(`memberships`, payload.body.body || payload.body);
        performSuccessActions(payload, response);
        yield put(addItemToGroupSuccess(response));
    } catch (error: any) {
        error = error as AxiosError;
        yield put(addItemToGroupError(error?.response?.data || {code: '400', description: 'Something went wrong'}));
    }
}

// Add Threads to Projects
function* removeMemberFromProject({payload}: PayloadAction<ReducerActionType>) {
    try {
        const response: AxiosResponse = yield ApiService.callDelete(`projects/${payload.body.id}/accounts/${payload.body.accountId}`, {});
        performSuccessActions(payload);
        yield put(deleteMemberFromProjectSuccess(response));
    } catch (error: any) {
        error = error as AxiosError;
        yield put(deleteMemberFromProjectError(error?.response?.data || {code: '400', description: 'Something went wrong'}));
    }
}

function* removeMembershipFromProject({payload}: PayloadAction<ReducerActionType>) {
    try {
        const response: AxiosResponse = yield ApiService.callDelete(`memberships/${payload.body.id}`, {});
        performSuccessActions(payload);
        yield put(deleteMembershipFromProjectSuccess(response));
    } catch (error: any) {
        error = error as AxiosError;
        yield put(deleteMembershipFromProjectError(error?.response?.data || {code: '400', description: 'Something went wrong'}));
    }
}

function* removeMemberFromOrganization({payload}: PayloadAction<ReducerActionType>) {
    try {
        const response: AxiosResponse = yield ApiService.callDelete(`organizations/${payload.body.id}/accounts/${payload.body.accountId}`, {});
        performSuccessActions(payload);
        yield put(deleteMemberFromOrganizationSuccess(response));
    } catch (error: any) {
        error = error as AxiosError;
        yield put(deleteMemberFromOrganizationError(error?.response?.data || {code: '400', description: 'Something went wrong'}));
    }
}

export function* watchAddItemToGroup() {
    yield takeEvery(addItemToGroup.type, addItemToGroupService);
}

export function* watchDeleteMemberFromProject() {
    yield takeEvery(deleteMemberFromProject.type, removeMemberFromProject);
}

export function* watchDeleteMembershipFromProject() {
    yield takeEvery(deleteMembershipFromProject.type, removeMembershipFromProject);
}

export function* watchDeleteMemberFromOrganization() {
    yield takeEvery(deleteMemberFromOrganization.type, removeMemberFromOrganization);
}

export default function* rootSaga() {
    yield all([
        fork(watchAddItemToGroup),
        fork(watchDeleteMemberFromProject),
        fork(watchDeleteMembershipFromProject),
        fork(watchDeleteMemberFromOrganization),
    ]);
}
