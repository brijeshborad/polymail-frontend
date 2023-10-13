import {
    createProjects,
    createProjectsError,
    createProjectsSuccess, editProjects, editProjectsError, editProjectsSuccess,
    getAllProjects,
    getAllProjectsError,
    getAllProjectsSuccess,
    getProjectById,
    getProjectByIdError,
    getProjectByIdSuccess,
    getProjectMembers,
    getProjectMembersError,
    getProjectMembersInvites,
    getProjectMembersInvitesError,
    getProjectMembersInvitesSuccess,
    getProjectMembersSuccess, removeThreadFromProject, removeThreadFromProjectError, removeThreadFromProjectSuccess,
    undoProjectUpdate,
    updateOptimisticProject,
    updateProject,
    updateProjectError,
    updateProjectMemberRole,
    updateProjectMemberRoleError,
    updateProjectMemberRoleSuccess,
    updateProjectSuccess
} from "@/redux/projects/action-reducer";
import { ReducerActionType } from "@/types";
import ApiService from "@/utils/api.service";
import { performSuccessActions } from "@/utils/common-redux.functions";
import { all, fork, put, takeLatest } from "@redux-saga/core/effects";
import { PayloadAction } from "@reduxjs/toolkit";
import { AxiosError, AxiosResponse } from "axios";


function* getProjects() {
    try {
        const response: AxiosResponse = yield ApiService.callGet(`projects`, null);
        yield put(getAllProjectsSuccess(response));
    } catch (error: any) {
        error = error as AxiosError;
        yield put(getAllProjectsError(error?.response?.data || {code: '400', description: 'Something went wrong'}));
    }
}

function* getProject({payload}: PayloadAction<ReducerActionType>) {
    try {
        const response: AxiosResponse = yield ApiService.callGet(`projects/${payload.body.id}`, null);
        performSuccessActions(payload);
        yield put(getProjectByIdSuccess(response));
    } catch (error: any) {
        error = error as AxiosError;
        yield put(getProjectByIdError(error?.response?.data || {code: '400', description: 'Something went wrong'}));
    }
}

function* addProjects({payload}: PayloadAction<ReducerActionType>) {
    try {
        const response: AxiosResponse = yield ApiService.callPost(`projects`, {name : payload.body.name,
             accountId : payload.body.accountId, organizationId : payload.body.organizationId, emoji : payload.body.emoji});
             performSuccessActions(payload);
        yield put(createProjectsSuccess(response));
    } catch (error: any) {
        error = error as AxiosError;
        performSuccessActions(payload);
        yield put(createProjectsError(error?.response?.data || {code: '400', description: 'Something went wrong'}));
    }
}


function* getProjectMembersService({payload}: PayloadAction<ReducerActionType>) {
    try {
        const response: AxiosResponse = yield ApiService.callGet(`projects/${payload.body.projectId}/accounts`, {});
        performSuccessActions(payload);
        yield put(getProjectMembersSuccess(response));
    } catch (error: any) {
        error = error as AxiosError;
        yield put(getProjectMembersError(error?.response?.data || {code: '400', description: 'Something went wrong'}));
    }
}


function* getProjectMembersInvitees({payload}: PayloadAction<ReducerActionType>) {
    try {
        const response: AxiosResponse = yield ApiService.callGet(`projects/${payload.body.projectId}/invites`, {});
        performSuccessActions(payload);
        yield put(getProjectMembersInvitesSuccess(response));
    } catch (error: any) {
        error = error as AxiosError;
        yield put(getProjectMembersInvitesError(error?.response?.data || {code: '400', description: 'Something went wrong'}));
    }
}

function* updateProjectMembersData({payload}: PayloadAction<ReducerActionType>) {
    try {
        const response: AxiosResponse = yield ApiService.callPatch(`projects/${payload.body.projectId}/accounts/${payload.body.accountId}`, payload.body.body);
        performSuccessActions(payload);
        yield put(updateProjectMemberRoleSuccess(response));
    } catch (error: any) {
        error = error as AxiosError;
        yield put(updateProjectMemberRoleError(error?.response?.data || {code: '400', description: 'Something went wrong'}));
    }
}

function* updateProjectData({payload}: PayloadAction<ReducerActionType>) {
    try {
        const response: AxiosResponse = yield ApiService.callPatch(`projects/${payload.body.id}`, payload.body.body);
        performSuccessActions(payload);
        yield put(updateProjectSuccess(response));
    } catch (error: any) {
        error = error as AxiosError;
        yield put(updateProjectError(error?.response?.data || {code: '400', description: 'Something went wrong'}));
    }
}

function* updateProjectDataWithUndo({payload}: PayloadAction<ReducerActionType>) {
    try {
        const response: AxiosResponse = yield ApiService.callPatch(`projects/${payload.body.id}`, payload.body.do);
        yield put(updateProjectSuccess(response));
        performSuccessActions(payload);

    } catch (error: any) {
        error = error as AxiosError;
        yield put(undoProjectUpdate({body:{
          error: error?.response?.data || {code: '400', description: 'Something went wrong'},
          project: {id: payload.body.id, body: payload.body}
        }
        }));
        performSuccessActions(payload);

    }
}

function* removeProjectFormThreads({payload}: PayloadAction<ReducerActionType>) {
    try {
        let projectId = payload.body.projectId || payload.body.body.projectId
        let threadId = payload.body.threadId || payload.body.body.threadId
        const response: AxiosResponse = yield ApiService.callDelete(`projects/${projectId}/threads/${threadId}`, {});
        performSuccessActions(payload);
        yield put(removeThreadFromProjectSuccess(response));
    } catch (error: any) {
        error = error as AxiosError;
        performSuccessActions(payload);
        yield put(removeThreadFromProjectError(error?.response?.data || {code: '400', description: 'Something went wrong'}));
    }
}

function* editProjectsData({payload}: PayloadAction<ReducerActionType>) {
    try {
        const response: AxiosResponse = yield ApiService.callPatch(`projects/${payload.body.projectId}`, {
            name : payload.body.name,
            accountId : payload.body.accountId,
            organizationId : payload.body.organizationId,
            emoji : payload.body.emoji
        });
        performSuccessActions(payload);
        yield put(editProjectsSuccess(response));
    } catch (error: any) {
        error = error as AxiosError;
        performSuccessActions(payload);
        yield put(editProjectsError(error?.response?.data || {code: '400', description: 'Something went wrong'}));
    }
}

export function* watchGetProjects() {
    yield takeLatest(getAllProjects.type, getProjects);
}

export function* watchAddProjects() {
    yield takeLatest(createProjects.type, addProjects);
}

export function* watchGetProjectMembers() {
    yield takeLatest(getProjectMembers.type, getProjectMembersService);
}

export function* watchGetProjectById() {
    yield takeLatest(getProjectById.type, getProject);
}

export function* watchGetProjectMembersInvitees() {
    yield takeLatest(getProjectMembersInvites.type, getProjectMembersInvitees);
}

export function* watchUpdateProjectMembersData() {
    yield takeLatest(updateProjectMemberRole.type, updateProjectMembersData);
}

export function* watchUpdateProjectData() {
    yield takeLatest(updateProject.type, updateProjectData);
}

export function* watchUpdateOptimisticProjectData() {
    yield takeLatest(updateOptimisticProject.type, updateProjectDataWithUndo);
}


export function* watchRemoveProjectFromThread() {
    yield takeLatest(removeThreadFromProject.type, removeProjectFormThreads);
}

export function* watchEditProjectData() {
    yield takeLatest(editProjects.type, editProjectsData);
}

export default function* rootSaga() {
    yield all([
        fork(watchGetProjects),
        fork(watchAddProjects),
        fork(watchGetProjectMembers),
        fork(watchGetProjectById),
        fork(watchGetProjectMembersInvitees),
        fork(watchUpdateProjectMembersData),
        fork(watchUpdateProjectData),
        fork(watchUpdateOptimisticProjectData),
        fork(watchRemoveProjectFromThread),
        fork(watchEditProjectData),
    ]);
}

