import {PayloadAction} from "@reduxjs/toolkit";
import {all, fork, put, takeLatest} from "@redux-saga/core/effects";
import {
    getAllAccountError,
    getAllAccountSuccess,
    getAllAccount,
    getSyncAccount,
    getSyncAccountSuccess,
    getSyncAccountError
} from "@/redux/accounts/action-reducer";
import ApiService from "@/utils/api.service";
import {AxiosError, AxiosResponse} from "axios";

function* getAccountDetails(payload: PayloadAction<any>) {
    try {
        const response: AxiosResponse = yield ApiService.callGet(`accounts`, {});
        yield put(getAllAccountSuccess(response));
    } catch (error: AxiosError | any) {
        yield put(getAllAccountError(error.response.data));
    }
}

function* getAccountSync({payload: {id}}: PayloadAction<{ id: string }>) {
    try {
        const response: AxiosResponse = yield ApiService.callGet(`accounts/${id}/sync`, null);
        console.log('response' , response)
        yield put(getSyncAccountSuccess(response));
    } catch (error: AxiosError | any) {
        yield put(getSyncAccountError(error.response.data));
    }
}

export function* watchGetAccount() {
    yield takeLatest(getAllAccount.type, getAccountDetails);
}

export function* watchGetSyncAccount() {
    yield takeLatest(getSyncAccount.type, getAccountSync);
}

export default function* rootSaga() {
    yield all([
        fork(watchGetAccount),
        fork(watchGetSyncAccount),
    ]);
}

