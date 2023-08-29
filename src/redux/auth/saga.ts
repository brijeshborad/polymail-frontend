import {PayloadAction} from "@reduxjs/toolkit";
import {all, fork, put, takeLatest} from "@redux-saga/core/effects";
import {
    changePassword,
    changePasswordError,
    changePasswordSuccess,
    forgotPassword,
    forgotPasswordError,
    forgotPasswordSuccess,
    googleAuthLink,
    googleAuthLinkError,
    googleAuthLinkSuccess,
    loginError,
    loginSuccess,
    loginUser,
    logoutUser, magicCode, magicCodeError, magicCodeSuccess,
    registerError,
    registerSuccess,
    registerUser, resetPassword, resetPasswordError, resetPasswordSuccess
} from "@/redux/auth/action-reducer";
import ApiService from "@/utils/api.service";
import {AxiosError, AxiosResponse} from "axios";
import LocalStorageService from "@/utils/localstorage.service";
import Router from "next/router";

function* login({payload: {email, password}}: PayloadAction<{ email: string, password: string }>) {
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
    withToken?: boolean
}>) {
    try {
        let headers = {};
        if (!payload.withToken) {
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
        yield ApiService.callGet(`auth/logout`, null);
        LocalStorageService.clearStorage();
        Router.push('/auth/login');
    } catch (error: any) {
        LocalStorageService.clearStorage();
        Router.push('/auth/login');
    }
}

function* passwordChange({
                             payload: {
                                 password,
                                 newPasswordTwo,
                                 newPasswordOne
                             }
                         }: PayloadAction<{ password: string, newPasswordOne: string, newPasswordTwo: string }>) {
    try {
        yield ApiService.callPost(`auth/change`, {
            password, newPasswordTwo, newPasswordOne
        });
        yield put(changePasswordSuccess());
    } catch (error: any) {
        error = error as AxiosError;
        yield put(changePasswordError(error.response.data));
    }
}

function* forgotOldPassword({
                             payload: {
                                 email,
                                 url
                             }
                         }: PayloadAction<{ email: string, url: string }>) {
    try {
        yield ApiService.callPost(`auth/forgot`, {
            email, url
        }, {
            'Skip-Headers': true
        });
        yield put(forgotPasswordSuccess());
    } catch (error: any) {
        error = error as AxiosError;
        yield put(forgotPasswordError(error.response.data));
    }
}

function* updateNewPassword({
                                payload: {
                                    Password,
                                    code
                                }
                            }: PayloadAction<{ Password: string, code: string }>) {
    try {
        yield ApiService.callPost(`auth/reset?code=${code}`, {
            Password
        }, {
            'Skip-Headers': true
        });
        yield put(resetPasswordSuccess());
    } catch (error: any) {
        error = error as AxiosError;
        yield put(resetPasswordError(error.response.data));
    }
}

function* compareCode({ payload: {code}}: PayloadAction<{ code: string }>) {
    try {
        const response: AxiosResponse =  yield ApiService.callGet(`auth/magic?code=${code}`, {}, {
            'Skip-Headers': true
        });
        yield put(magicCodeSuccess(response));
    } catch (error: any) {
        error = error as AxiosError;
        yield put(magicCodeError(error.response.data));
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

export function* watchChangePassword() {
    yield takeLatest(changePassword.type, passwordChange);
}

export function* watchResetPassword() {
    yield takeLatest(forgotPassword.type, forgotOldPassword);
}

export function* watchUpdateNewPassword() {
    yield takeLatest(resetPassword.type, updateNewPassword);
}

export function* watchCompareCode() {
    yield takeLatest(magicCode.type, compareCode);
}

export default function* rootSaga() {
    yield all([
        fork(watchLoginUser),
        fork(watchRegisterUser),
        fork(watchGoogleAuthLink),
        fork(watchLogoutUser),
        fork(watchChangePassword),
        fork(watchResetPassword),
        fork(watchUpdateNewPassword),
        fork(watchCompareCode),
    ]);
}

