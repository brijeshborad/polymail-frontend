import {
    createProjects,
    createProjectsError,
    createProjectsSuccess,
    editProjects,
    editProjectsError,
    editProjectsSuccess,
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
    getProjectMembersSuccess, removeProject, removeProjectError,
    removeProjectSuccess,
    removeThreadFromProject,
    removeThreadFromProjectError,
    removeThreadFromProjectSuccess,
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
import {performErrorActions, performSuccessActions} from "@/utils/common-redux.functions";
import { all, fork, put, takeEvery } from "@redux-saga/core/effects";
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
        const response: AxiosResponse = yield ApiService.callGet(`projects/${payload.body.id}`, {enriched: true});
        performSuccessActions(payload);
        let finalResponse: any = response;
        yield put(getProjectMembersSuccess(finalResponse.accounts));
        yield put(getProjectMembersInvitesSuccess(finalResponse.invites));
        yield put(getProjectByIdSuccess(finalResponse));
    } catch (error: any) {
        error = error as AxiosError;
        yield put(getProjectByIdError(error?.response?.data || {code: '400', description: 'Something went wrong'}));
    }
}

function* addProjects({payload}: PayloadAction<ReducerActionType>) {
    try {
        const response: AxiosResponse = yield ApiService.callPost(`projects`, {name : payload.body.name,
             accountId : payload.body.accountId, organizationId : payload.body.organizationId, emoji : payload.body.emoji});
             performSuccessActions(payload, response);
        yield put(createProjectsSuccess(response));
    } catch (error: any) {
        error = error as AxiosError;
        performErrorActions(payload);
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
        performErrorActions(payload);
        yield put(editProjectsError(error?.response?.data || {code: '400', description: 'Something went wrong'}));
    }
}

function* removeProjectData({payload}: PayloadAction<ReducerActionType>) {
    try {
        const response: AxiosResponse = yield ApiService.callDelete(`projects/${payload.body.projectId}`, null);
        performSuccessActions(payload);
        yield put(removeProjectSuccess(response));
    } catch (error: any) {
        error = error as AxiosError;
        performSuccessActions(payload);
        yield put(removeProjectError(error?.response?.data || {code: '400', description: 'Something went wrong'}));
    }
}

export function* watchGetProjects() {
    yield takeEvery(getAllProjects.type, getProjects);
}

export function* watchAddProjects() {
    yield takeEvery(createProjects.type, addProjects);
}

export function* watchGetProjectMembers() {
    yield takeEvery(getProjectMembers.type, getProjectMembersService);
}

export function* watchGetProjectById() {
    yield takeEvery(getProjectById.type, getProject);
}

export function* watchGetProjectMembersInvitees() {
    yield takeEvery(getProjectMembersInvites.type, getProjectMembersInvitees);
}

export function* watchUpdateProjectMembersData() {
    yield takeEvery(updateProjectMemberRole.type, updateProjectMembersData);
}

export function* watchUpdateProjectData() {
    yield takeEvery(updateProject.type, updateProjectData);
}

export function* watchUpdateOptimisticProjectData() {
    yield takeEvery(updateOptimisticProject.type, updateProjectDataWithUndo);
}


export function* watchRemoveProjectFromThread() {
    yield takeEvery(removeThreadFromProject.type, removeProjectFormThreads);
}

export function* watchEditProjectData() {
    yield takeEvery(editProjects.type, editProjectsData);
}

export function* watchRemoveProjectData() {
    yield takeEvery(removeProject.type, removeProjectData);
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
        fork(watchRemoveProjectData),
    ]);
}

