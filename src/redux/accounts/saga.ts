import {PayloadAction} from "@reduxjs/toolkit";
import {all, fork, put, takeLatest} from "@redux-saga/core/effects";
import {
    getAllAccountError,
    getAllAccountSuccess,
    getAllAccount,
    getSyncAccount,
    getSyncAccountSuccess,
    getSyncAccountError, updateAccountDetailsSuccess, updateAccountDetailsError, updateAccountDetails
} from "@/redux/accounts/action-reducer";
import ApiService from "@/utils/api.service";
import {AxiosError, AxiosResponse} from "axios";

function* getAccountDetails() {
    try {
        const response: AxiosResponse = yield ApiService.callGet(`accounts`, {});
        yield put(getAllAccountSuccess(response));
    } catch (error: any) {
        error = error as AxiosError;
        yield put(getAllAccountError(error.response.data));
    }
}

function* getAccountSync({payload: {id}}: PayloadAction<{ id: string }>) {
    try {
        const response: AxiosResponse = yield ApiService.callGet(`accounts/${id}/sync`, null);
        yield put(getSyncAccountSuccess(response));
    } catch (error: any) {
        error = error as AxiosError;
        yield put(getSyncAccountError(error.response.data));
    }
}

function* updateAccountDetail({payload: {signature, id}}: PayloadAction<{ signature?: string,  id: string }>) {
    try {
        const response: AxiosResponse = yield ApiService.callPatch(`accounts/${id}`, {
            ...(signature ? {signature} : {}),
        });
        yield put(updateAccountDetailsSuccess(response));
    } catch (error: any) {
        error = error as AxiosError;
        yield put(updateAccountDetailsError(error.response.data));
    }
}

export function* watchGetAccount() {
    yield takeLatest(getAllAccount.type, getAccountDetails);
}

export function* watchGetSyncAccount() {
    yield takeLatest(getSyncAccount.type, getAccountSync);
}

export function* watchUpdateAccountDetails() {
    yield takeLatest(updateAccountDetails.type, updateAccountDetail);
}

export default function* rootSaga() {
    yield all([
        fork(watchGetAccount),
        fork(watchGetSyncAccount),
        fork(watchUpdateAccountDetails),
    ]);
}

