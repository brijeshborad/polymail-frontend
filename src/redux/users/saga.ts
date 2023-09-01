import {PayloadAction} from "@reduxjs/toolkit";
import {AxiosError, AxiosResponse} from "axios";
import ApiService from "@/utils/api.service";
import {all, fork, put, takeLatest} from "@redux-saga/core/effects";
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
    uploadProfilePictureSuccess
} from "@/redux/users/action-reducer";

function* updateUserPersonalDetails({payload: {firstName, lastName, middleName}}: PayloadAction<{ firstName?: string, lastName?: string, middleName?: string  }>) {
    try {
        const response: AxiosResponse = yield ApiService.callPatch(`users`, {
            ...(firstName ? {firstName} : {}),
            ...(lastName ? {lastName} : {}),
            ...(middleName ? {middleName} : {}),
        });
        yield put(updateUsersDetailsSuccess(response));
    } catch (error: any) {
        error = error as AxiosError;
        yield put(updateUsersDetailsError(error.response.data));
    }
}

function* getUsePersonalDetails() {
    try {
        const response: AxiosResponse = yield ApiService.callGet(`users`, {});
        yield put(getUsersDetailsSuccess(response));
    } catch (error: any) {
        error = error as AxiosError;
        yield put(getUsersDetailsError(error.response.data));
    }
}


function* generateProfilePictureUploadUrl({payload: { file}}: PayloadAction<{
    file: File
}>) {
    try {
        const {name, type} = file;
        let response: AxiosResponse = yield ApiService.callPatch(`users/avatar`, {
            filename: name,
            mimeType: type
        });

        if (response && (response as any)?.url) {
            yield ApiService.callPut((response as any)?.url, file, {"Content-Type": type, 'Skip-Headers': true});
        }

        yield put(uploadProfilePictureSuccess(response));
    } catch (error: any) {
        error = error as AxiosError;
        yield put(uploadProfilePictureError(error.response.data));
    }
}

function* getProfilePictureUrl({payload: { }}: PayloadAction<{}>) {
    try {
        let response: AxiosResponse = yield ApiService.callGet(`users/avatar`, {});
        yield put(getProfilePictureSuccess(response));
    } catch (error: any) {
        error = error as AxiosError;
        yield put(getProfilePictureError(error.response.data));
    }
}


export function* watchUpdateCurrentDraftMessage() {
    yield takeLatest(updateUsersDetails.type, updateUserPersonalDetails);
}

export function* watchGetUserDetails() {
    yield takeLatest(getUsersDetails.type, getUsePersonalDetails);
}

export function* watchAddProfilePictureUrlToS3() {
    yield takeLatest(uploadProfilePicture.type, generateProfilePictureUploadUrl);
}

export function* watchGetProfilePictureUrlFromS3() {
    yield takeLatest(getProfilePicture.type, getProfilePictureUrl);
}

export default function* rootSaga() {
    yield all([
        fork(watchUpdateCurrentDraftMessage),
        fork(watchGetUserDetails),
        fork(watchAddProfilePictureUrlToS3),
        fork(watchGetProfilePictureUrlFromS3),
    ]);
}
