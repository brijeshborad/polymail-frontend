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
    updateUsersDetailsSuccess
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


export function* watchUpdateCurrentDraftMessage() {
    yield takeLatest(updateUsersDetails.type, updateUserPersonalDetails);
}

export function* watchGetUserDetails() {
    yield takeLatest(getUsersDetails.type, getUsePersonalDetails);
}

export default function* rootSaga() {
    yield all([
        fork(watchUpdateCurrentDraftMessage),
        fork(watchGetUserDetails),
    ]);
}
