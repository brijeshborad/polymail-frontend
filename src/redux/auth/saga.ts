import {PayloadAction} from "@reduxjs/toolkit";
import {all, fork, put, takeLatest} from "@redux-saga/core/effects";
import {
    googleAuthLink,
    googleAuthLinkError,
    googleAuthLinkSuccess,
    loginError,
    loginSuccess,
    loginUser, logoutUser, logoutUserError, logoutUserSuccess,
    registerError,
    registerSuccess,
    registerUser
} from "@/redux/auth/action-reducer";
import ApiService from "@/utils/api.service";
import {AxiosError, AxiosResponse} from "axios";
import LocalStorageService from "@/utils/localstorage.service";
// import {LoginWithGoogle, User} from "@/models";

function* login({payload: {email, password}}: PayloadAction<{email: string, password: string}>) {
    try {
        const response: AxiosResponse = yield ApiService.callPost(`auth/login`, {email, password}, {
            'Skip-Headers': true
        });
        LocalStorageService.updateUser('store', response)
        yield put(loginSuccess(response));
    } catch (error: AxiosError | any) {
        yield put(loginError(error.response.data));
    }
}

function* register({payload: {email, password}}: PayloadAction<{ email: string, password: string }>) {
    try {
        const response: AxiosResponse = yield ApiService.callPost(`users`, {
            email,
            password
        }, {
            'Skip-Headers': true
        });
        LocalStorageService.updateUser('store', response)
        yield put(registerSuccess(response));
    } catch (error: any) {
        error = error as AxiosError;
        yield put(registerError(error.response.data));
    }
}

function* getGoogleAuthLink({payload}: PayloadAction<{
    mode?: string,
    redirectUrl?: string
    accountType?: string
    platform?: string,
    withToken?: boolean}>) {
    try {
        let headers = {};
        if(!payload.withToken) {
            headers = {
                'Skip-Headers': true
            }
        }
        delete payload.withToken;

        const response: AxiosResponse = yield ApiService.callPost(`auth/oauth2link`, payload, headers);
        yield put(googleAuthLinkSuccess(response));
    } catch (error: any) {
        error = error as AxiosError;
        yield put(googleAuthLinkError(error.response.data));
    }
}

function* logout() {
    try {
        const response: AxiosResponse = yield ApiService.callGet(`auth/logout`, null);
        LocalStorageService.clearStorage();
        yield put(logoutUserSuccess(response));
    } catch (error: any) {
        error = error as AxiosError;
        yield put(logoutUserError(error.response.data));
    }

}

export function* watchLoginUser() {
    yield takeLatest(loginUser.type, login);
}

export function* watchRegisterUser() {
    yield takeLatest(registerUser.type, register);
}

export function* watchGoogleAuthLink() {
    yield takeLatest(googleAuthLink.type, getGoogleAuthLink);
}

export function* watchLogoutUser() {
    yield takeLatest(logoutUser.type, logout);
}

export default function* rootSaga() {
    yield all([
        fork(watchLoginUser),
        fork(watchRegisterUser),
        fork(watchGoogleAuthLink),
        fork(watchLogoutUser),
    ]);
}

