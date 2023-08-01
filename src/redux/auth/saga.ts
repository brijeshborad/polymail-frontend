import {PayloadAction} from "@reduxjs/toolkit";
import {all, fork, put, takeLatest} from "@redux-saga/core/effects";
import {
    loginError,
    loginSuccess,
    loginUser,
    registerError,
    registerSuccess,
    registerUser
} from "@/redux/auth/action-reducer";
import ApiService from "@/utils/api.service";
import {AxiosResponse} from "axios";
import {setStoreLocal} from "@/utils/localstorage.service";

function* login({payload: {email, password}}: PayloadAction<any>) {
    try {
        const response: AxiosResponse = yield ApiService.callPost(`auth/login`, {email, password}, {
            'Skip-Headers': true
        });
        setStoreLocal('poly-user', JSON.stringify(response));
        yield put(loginSuccess(response.data));
    } catch (error) {
        yield put(loginError(error.response.data));
    }
}

function* register({payload: {email, password}}: PayloadAction<any>) {
    try {
        const response: AxiosResponse = yield ApiService.callPost(`users`, {email, password}, {
            'Skip-Headers': true
        });
        setStoreLocal('poly-user', JSON.stringify(response));
        yield put(registerSuccess(response));
    } catch (error) {
        yield put(registerError(error.response.data));
    }
}

export function* watchLoginUser() {
    yield takeLatest(loginUser.type, login);
}

export function* watchRegisterUser() {
    yield takeLatest(registerUser.type, register);
}

export default function* rootSaga() {
    yield all([
        fork(watchLoginUser),
        fork(watchRegisterUser),
    ]);
}

