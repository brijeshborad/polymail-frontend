import {PayloadAction} from "@reduxjs/toolkit";
import {all, fork, put, takeLatest} from "@redux-saga/core/effects";
import {
    getAllAccountError,
    getAllAccountSuccess,
    getAllAccount,
    updateAccountDetailsSuccess,
    updateAccountDetailsError,
    updateAccountDetails,
    removeAccountDetailsSuccess, removeAccountDetailsError, removeAccountDetails
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

function* removeAccount({payload: {id}}: PayloadAction<{ id: string }>) {
    try {
        const response: AxiosResponse = yield ApiService.callDelete(`accounts/${id}`, {});
        yield put(removeAccountDetailsSuccess(response));
    } catch (error: any) {
        error = error as AxiosError;
        yield put(removeAccountDetailsError(error.response.data));
    }
}

export function* watchGetAccount() {
    yield takeLatest(getAllAccount.type, getAccountDetails);
}

export function* watchUpdateAccountDetails() {
    yield takeLatest(updateAccountDetails.type, updateAccountDetail);
}

export function* watchRemoveAccountDetails() {
    yield takeLatest(removeAccountDetails.type, removeAccount);
}

export default function* rootSaga() {
    yield all([
        fork(watchGetAccount),
        fork(watchUpdateAccountDetails),
        fork(watchRemoveAccountDetails),
    ]);
}

