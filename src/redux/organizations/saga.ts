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
import { ReducerActionType } from "@/types";
import { performSuccessActions } from "@/utils/common-redux.functions";

function* getOrganizations() {
    try {
        const response: AxiosResponse = yield ApiService.callGet(`organizations`, {});
        yield put(getAllOrganizationsSuccess(response));
    } catch (error: any) {
        error = error as AxiosError;
        yield put(getAllOrganizationsError(error?.response?.data || {code: '400', description: 'Something went wrong'}));
    }
}

function* addOrganizations({payload}: PayloadAction<ReducerActionType>) {
    try {
        const response: AxiosResponse = yield ApiService.callPost(`organizations`, {name: payload.body.name,accountId: payload.body.accountId});
        performSuccessActions(payload);
        yield put(addOrganizationSuccess(response));
    } catch (error: any) {
        error = error as AxiosError;
        yield put(addOrganizationError(error?.response?.data || {code: '400', description: 'Something went wrong'}));
    }
}

function* updateOrganizations({payload}: PayloadAction<ReducerActionType>) {
    try {
        const response: AxiosResponse = yield ApiService.callPatch(`organizations/${payload.body.id}`, {preferences: payload.body.preferences});
        performSuccessActions(payload);
        yield put(editOrganizationSuccess(response));

    } catch (error: any) {
        error = error as AxiosError;
        yield put(editOrganizationError(error?.response?.data || {code: '400', description: 'Something went wrong'}));
    }
}


function* getOrganizationMembersService({payload}: PayloadAction<ReducerActionType>) {
    try {
        const response: AxiosResponse = yield ApiService.callGet(`organizations/${payload.body.orgId}/accounts`, {});
        performSuccessActions(payload);
        yield put(getOrganizationMembersSuccess(response));
    } catch (error: any) {
        error = error as AxiosError;
        yield put(getOrganizationMembersError(error?.response?.data || {code: '400', description: 'Something went wrong'}));
    }
}

function* deleteOrganization({payload}: PayloadAction<ReducerActionType>) {
    try {
        const response: AxiosResponse = yield ApiService.callDelete(`organizations/${payload.body.id}`, {});
        performSuccessActions(payload);
        yield put(removeOrganizationSuccess(response));
    } catch (error: any) {
        error = error as AxiosError;
        yield put(removeOrganizationError(error?.response?.data || {code: '400', description: 'Something went wrong'}));
    }
}

function* updateOrganizationMembersData({payload}: PayloadAction<ReducerActionType>) {
    try {
        const response: AxiosResponse = yield ApiService.callPatch(`organizations/${payload.body.organizationId}/accounts/${payload.body.accountId}`, payload.body.body);
        performSuccessActions(payload);
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

