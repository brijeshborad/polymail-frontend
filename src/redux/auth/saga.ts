import {PayloadAction} from "@reduxjs/toolkit";
import {all, fork, put, takeLatest} from "@redux-saga/core/effects";
import {
    googleAuthLink,
    googleAuthLinkError,
    googleAuthLinkSuccess,
    loginError,
    loginSuccess,
    loginUser, logoutUser,
    registerError,
    registerSuccess,
    registerUser
} from "@/redux/auth/action-reducer";
import ApiService from "@/utils/api.service";
import {AxiosError, AxiosResponse} from "axios";
import {removeStoreLocal, setStoreLocal} from "@/utils/localstorage.service";

function* login({payload: {email, password}}: PayloadAction<any>) {
    try {
        const response: AxiosResponse = yield ApiService.callPost(`auth/login`, {email, password}, {
            'Skip-Headers': true
        });
        setStoreLocal('poly-user', JSON.stringify(response));
        yield put(loginSuccess(response));
    } catch (error: AxiosError | any) {
        yield put(loginError(error.response.data));
    }
}

function* register({payload: {email, password}}: PayloadAction<any>) {
    try {
        const response: AxiosResponse = yield ApiService.callPost(`users`, {
            email,
            password
        }, {
            'Skip-Headers': true
        });
        setStoreLocal('poly-user', JSON.stringify(response));
        yield put(registerSuccess(response));
    } catch (error: AxiosError | any) {
        yield put(registerError(error.response.data));
    }
}

function* getGoogleAuthLink({payload}: PayloadAction<any>) {
    try {
        const response: AxiosResponse = yield ApiService.callPost(`auth/oauth2link`, payload, {
            'Skip-Headers': true
        });
        yield put(googleAuthLinkSuccess(response));
    } catch (error: AxiosError | any) {
        yield put(googleAuthLinkError(error.response.data));
    }
}

function* logout() {
    yield ApiService.callGet(`auth/logout`, null);
    removeStoreLocal('poly-user');
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

