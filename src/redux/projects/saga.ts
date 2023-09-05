import {all, fork, put, takeLatest} from "@redux-saga/core/effects";
import ApiService from "@/utils/api.service";
import {AxiosError, AxiosResponse} from "axios";
import {
    createProjects,
    createProjectsError,
    createProjectsSuccess,
    getAllProjects,
    getAllProjectsError,
    getAllProjectsSuccess,
    getProjectMembers,
    getProjectMembersSuccess,
    getProjectMembersError,
    getProjectById,
    getProjectByIdSuccess,
    getProjectByIdError,
    getProjectMembersInvites,
    getProjectMembersInvitesSuccess,
    getProjectMembersInvitesError,
    updateProjectMemberRoleError,
    updateProjectMemberRoleSuccess,
    updateProjectMemberRole,
} from "@/redux/projects/action-reducer";
import {PayloadAction} from "@reduxjs/toolkit";


function* getProjects() {
    try {
        const response: AxiosResponse = yield ApiService.callGet(`projects`, null);
        yield put(getAllProjectsSuccess(response));
    } catch (error: any) {
        error = error as AxiosError;
        yield put(getAllProjectsError(error?.response?.data || {code: '400', description: 'Something went wrong'}));
    }
}

function* getProject({payload: {id}}: PayloadAction<{id: string}>) {
    try {
        const response: AxiosResponse = yield ApiService.callGet(`projects/${id}`, null);
        yield put(getProjectByIdSuccess(response));
    } catch (error: any) {
        error = error as AxiosError;
        yield put(getProjectByIdError(error?.response?.data || {code: '400', description: 'Something went wrong'}));
    }
}

function* addProjects({payload: {name, accountId, organizationId}}: PayloadAction<{name: string, accountId: string, organizationId: string}>) {
    try {
        const response: AxiosResponse = yield ApiService.callPost(`projects`, {name, accountId, organizationId});
        yield put(createProjectsSuccess(response));
    } catch (error: any) {
        error = error as AxiosError;
        yield put(createProjectsError(error?.response?.data || {code: '400', description: 'Something went wrong'}));
    }
}


function* getProjectMembersService({payload: {projectId}}: PayloadAction<{ projectId: string }>) {
    try {
        const response: AxiosResponse = yield ApiService.callGet(`projects/${projectId}/accounts`, {});
        yield put(getProjectMembersSuccess(response));
    } catch (error: any) {
        error = error as AxiosError;
        yield put(getProjectMembersError(error?.response?.data || {code: '400', description: 'Something went wrong'}));
    }
}


function* getProjectMembersInvitees({payload: {projectId}}: PayloadAction<{ projectId: string }>) {
    try {
        const response: AxiosResponse = yield ApiService.callGet(`projects/${projectId}/invites`, {});
        yield put(getProjectMembersInvitesSuccess(response));
    } catch (error: any) {
        error = error as AxiosError;
        yield put(getProjectMembersInvitesError(error?.response?.data || {code: '400', description: 'Something went wrong'}));
    }
}

function* updateProjectMembersData({payload: {projectId, accountId, body}}: PayloadAction<{projectId: string, accountId: string, body: {role: string}}>) {
    try {
        const response: AxiosResponse = yield ApiService.callPatch(`projects/${projectId}/accounts/${accountId}`, body);
        yield put(updateProjectMemberRoleSuccess(response));
    } catch (error: any) {
        error = error as AxiosError;
        yield put(updateProjectMemberRoleError(error?.response?.data || {code: '400', description: 'Something went wrong'}));
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

export default function* rootSaga() {
    yield all([
        fork(watchGetProjects),
        fork(watchAddProjects),
        fork(watchGetProjectMembers),
        fork(watchGetProjectById),
        fork(watchGetProjectMembersInvitees),
        fork(watchUpdateProjectMembersData),
    ]);
}

