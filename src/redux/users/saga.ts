import {PayloadAction} from "@reduxjs/toolkit";
import {AxiosError, AxiosResponse} from "axios";
import ApiService from "@/utils/api.service";
import {all, fork, put, takeEvery} from "@redux-saga/core/effects";
import {
    getUsersDetails,
    getUsersDetailsError,
    getUsersDetailsSuccess,
    updateUsersDetails,
    updateUsersDetailsError,
    updateUsersDetailsSuccess,
    getProfilePicture,
    getProfilePictureError,
    getProfilePictureSuccess,
    uploadProfilePicture,
    uploadProfilePictureError,
    uploadProfilePictureSuccess, removeProfilePictureSuccess, removeProfilePictureError, removeProfilePicture,
    removeProfileData,
    removeProfileDataSuccess,
    removeProfileDataError,
    logoutAllUser,
    logoutAllUserSuccess,
    logoutAllUserError
} from "@/redux/users/action-reducer";
import { ReducerActionType } from "@/types";
import { performSuccessActions } from "@/utils/common-redux.functions";

function* updateUserPersonalDetails({payload}: PayloadAction<ReducerActionType>) {
    try {
        const response: AxiosResponse = yield ApiService.callPatch(`users`, {
            ...(payload.body.firstName ? {firstName: payload.body.firstName} : {}),
            ...(payload.body.lastName ? {lastName: payload.body.lastName} : {}),
            ...(payload.body.middleName ? {middleName: payload.body.middleName} : {}),
            ...(payload.body.onboarded ? {onboarded: payload.body.onboarded}: {})
        });
        performSuccessActions(payload);
        yield put(updateUsersDetailsSuccess(response));
    } catch (error: any) {
        error = error as AxiosError;
        yield put(updateUsersDetailsError(error?.response?.data || {code: '400', description: 'Something went wrong'}));
    }
}

function* getUsePersonalDetails() {
    try {
        const response: AxiosResponse = yield ApiService.callGet(`users`, {});
        yield put(getUsersDetailsSuccess(response));
    } catch (error: any) {
        error = error as AxiosError;
        yield put(getUsersDetailsError(error?.response?.data || {code: '400', description: 'Something went wrong'}));
    }
}


function* generateProfilePictureUploadUrl({payload}: PayloadAction<ReducerActionType>) {
    try {
        const {name, type} = payload.body.file;
        let response: AxiosResponse = yield ApiService.callPatch(`users/avatar`, {
            filename: name,
            mimeType: type
        });

        if (response && (response as any)?.url) {
            yield ApiService.callPut((response as any)?.url, payload.body.file, {"Content-Type": type, 'Skip-Headers': true});
        }
        performSuccessActions(payload);
        yield put(uploadProfilePictureSuccess(response));
    } catch (error: any) {
        error = error as AxiosError;
        yield put(uploadProfilePictureError(error?.response?.data || {code: '400', description: 'Something went wrong'}));
    }
}

function* getProfilePictureUrl({payload}: PayloadAction<ReducerActionType>) {
    try {
        let response: AxiosResponse = yield ApiService.callGet(`users/avatar`, {});
        performSuccessActions(payload);
        yield put(getProfilePictureSuccess(response));
    } catch (error: any) {
        error = error as AxiosError;
        yield put(getProfilePictureError(error?.response?.data || {code: '400', description: 'Something went wrong'}));
    }
}

function* deleteProfilePictureUrl({payload}: PayloadAction<ReducerActionType>) {
    try {
        let response: AxiosResponse = yield ApiService.callDelete(`users/avatar`, {});
        performSuccessActions(payload);
        yield put(removeProfilePictureSuccess(response));
    } catch (error: any) {
        error = error as AxiosError;
        yield put(removeProfilePictureError(error?.response?.data || {code: '400', description: 'Something went wrong'}));
    }
}

function* deleteProfileData({payload}: PayloadAction<ReducerActionType>) {
    try {
        let response: AxiosResponse = yield ApiService.callDelete(`users`, {});
        performSuccessActions(payload);
        yield put(removeProfileDataSuccess(response));
    } catch (error: any) {
        error = error as AxiosError;
        yield put(removeProfileDataError(error?.response?.data || {code: '400', description: 'Something went wrong'}));
    }
}

function* logoutFromAllDevices() {
    try {
        const response: AxiosResponse = yield ApiService.callGet(`/auth/logoutAll`, {});
        yield put(logoutAllUserSuccess(response));
    } catch (error: any) {
        error = error as AxiosError;
        yield put(logoutAllUserError(error?.response?.data || {code: '400', description: 'Something went wrong'}));
    }
}


export function* watchUpdateCurrentDraftMessage() {
    yield takeEvery(updateUsersDetails.type, updateUserPersonalDetails);
}

export function* watchGetUserDetails() {
    yield takeEvery(getUsersDetails.type, getUsePersonalDetails);
}

export function* watchAddProfilePictureUrlToS3() {
    yield takeEvery(uploadProfilePicture.type, generateProfilePictureUploadUrl);
}

export function* watchGetProfilePictureUrlFromS3() {
    yield takeEvery(getProfilePicture.type, getProfilePictureUrl);
}

export function* watchRemoveProfilePictureUrlFromS3() {
    yield takeEvery(removeProfilePicture.type, deleteProfilePictureUrl);
}

export function* watchRemoveProfileData() {
    yield takeEvery(removeProfileData.type, deleteProfileData);
}

export function* watchLogOutAllUsers() {
    yield takeEvery(logoutAllUser.type, logoutFromAllDevices);
}

export default function* rootSaga() {
    yield all([
        fork(watchUpdateCurrentDraftMessage),
        fork(watchGetUserDetails),
        fork(watchAddProfilePictureUrlToS3),
        fork(watchGetProfilePictureUrlFromS3),
        fork(watchRemoveProfilePictureUrlFromS3),
        fork(watchRemoveProfileData),
        fork(watchLogOutAllUsers),
    ]);
}
