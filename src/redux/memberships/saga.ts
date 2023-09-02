import {PayloadAction} from "@reduxjs/toolkit";
import {AxiosError, AxiosResponse} from "axios";
import ApiService from "@/utils/api.service";
import {all, fork, put, takeLatest} from "@redux-saga/core/effects";
import {
    addItemToGroup,
    addItemToGroupError,
    addItemToGroupSuccess, deleteMemberFromProject, deleteMemberFromProjectError, deleteMemberFromProjectSuccess,
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
function* removeMemberFromProject({payload}: PayloadAction<MembershipsRequestBody>) {
    try {
        const response: AxiosResponse = yield ApiService.callDelete(`memberships/${payload}`, null);
        yield put(deleteMemberFromProjectSuccess(response));
    } catch (error: any) {
        error = error as AxiosError;
        yield put(deleteMemberFromProjectError(error?.response?.data || {code: '400', description: 'Something went wrong'}));
    }
}

export function* watchAddItemToGroup() {
    yield takeLatest(addItemToGroup.type, addItemToGroupService);
}

export function* watchDeleteMemberFromProject() {
    yield takeLatest(deleteMemberFromProject.type, removeMemberFromProject);
}

export default function* rootSaga() {
    yield all([
        fork(watchAddItemToGroup),
        fork(watchDeleteMemberFromProject),
    ]);
}
