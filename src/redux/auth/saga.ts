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
    registerUser, resetPassword, resetPasswordError, resetPasswordSuccess
} from "@/redux/auth/action-reducer";
import { ReducerActionType } from "@/types";
import ApiService from "@/utils/api.service";
import { performSuccessActions } from "@/utils/common-redux.functions";
import LocalStorageService from "@/utils/localstorage.service";
import { all, fork, put, takeLatest } from "@redux-saga/core/effects";
import { PayloadAction } from "@reduxjs/toolkit";
import { AxiosError, AxiosResponse } from "axios";

function* login({payload: {email, password}}: PayloadAction<{ email: string, password: string }>) {
    try {
        const response: AxiosResponse = yield ApiService.callPost(`auth/login`, {email, password}, {
            'Skip-Headers': true
        });
        LocalStorageService.updateUser('store', response)
        yield put(loginSuccess(response));
    } catch (error: AxiosError | any) {
        yield put(loginError(error?.response?.data || {code: '400', description: 'Something went wrong'}));
    }
}

function* register({
                       payload: {
                           email,
                           password,
                           redirectUrl
                       }
                   }: PayloadAction<{ email: string, password: string, redirectUrl: string }>) {
    try {
        const response: AxiosResponse = yield ApiService.callPost(`auth/register`, {
            email,
            password,
            redirectUrl
        }, {
            'Skip-Headers': true
        });
        LocalStorageService.updateUser('store', response)
        window.location.href = redirectUrl;
    } catch (error: any) {
        error = error as AxiosError;
        yield put(registerError(error?.response?.data || {code: '400', description: 'Something went wrong'}));
    }
}

function* getGoogleAuthLink({payload}: PayloadAction<ReducerActionType>) {
    try {
        let headers = {};
        if (!payload.body.withToken) {
            headers = {
                'Skip-Headers': true
            }
        }
        delete payload.body.withToken;

        const response: AxiosResponse = yield ApiService.callPost(`auth/oauth2link`, payload.body, headers);
        yield put(googleAuthLinkSuccess(response));
        performSuccessActions(payload);

    } catch (error: any) {
        error = error as AxiosError;
        performSuccessActions(payload);
        yield put(googleAuthLinkError(error?.response?.data || {code: '400', description: 'Something went wrong'}));
    }
}

function* logout() {
    yield ApiService.callGet(`auth/logout`, null);
}

function* passwordChange({payload}: PayloadAction<ReducerActionType>) {
    try {
        yield ApiService.callPost(`auth/change`, {
            password: payload.body.password, newPasswordTwo: payload.body.newPasswordTwo, newPasswordOne: payload.body.newPasswordOne
        });
        performSuccessActions(payload);
        yield put(changePasswordSuccess());
    } catch (error: any) {
        error = error as AxiosError;
        yield put(changePasswordError(error?.response?.data || {code: '400', description: 'Something went wrong'}));
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
        yield put(forgotPasswordError(error?.response?.data || {code: '400', description: 'Something went wrong'}));
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
        yield put(resetPasswordError(error?.response?.data || {code: '400', description: 'Something went wrong'}));
    }
}

function* compareCode({payload: {code}}: PayloadAction<{ code?: string }>) {
    try {
        const response: AxiosResponse = yield ApiService.callGet(`auth/magic?code=${code}`, {}, {
            'Skip-Headers': true
        });
        yield put(magicCodeSuccess(response));
    } catch (error: any) {
        error = error as AxiosError;
        yield put(magicCodeError(error?.response?.data || {code: '400', description: 'Something went wrong'}));
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

