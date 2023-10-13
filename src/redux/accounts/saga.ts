import {PayloadAction} from "@reduxjs/toolkit";
import {all, fork, put, takeEvery} from "@redux-saga/core/effects";
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
import {performErrorActions, performSuccessActions} from "@/utils/common-redux.functions";
import {ReducerActionType} from "@/types";

function* getAccountDetails({payload}: PayloadAction<ReducerActionType>) {
    try {
        const response: AxiosResponse = yield ApiService.callGet(`accounts`, {});
        performSuccessActions(payload);
        yield put(getAllAccountSuccess(response));
    } catch (error: any) {
        error = error as AxiosError;
        performErrorActions(payload);
        yield put(getAllAccountError(error?.response?.data || {code: '400', description: 'Something went wrong'}));
    }
}

function* updateAccountDetail({payload}: PayloadAction<ReducerActionType>) {
    try {
        let signature = payload.body.signature;
        const response: AxiosResponse = yield ApiService.callPatch(`accounts/${payload.body.id}`, {
            ...(signature ? {signature} : {}),
        });
        yield put(updateAccountDetailsSuccess(response));
        performSuccessActions(payload);

    } catch (error: any) {
        error = error as AxiosError;
        performSuccessActions(payload);
        yield put(updateAccountDetailsError(error?.response?.data || {code: '400', description: 'Something went wrong'}));
    }
}

function* removeAccount({payload}: PayloadAction<ReducerActionType>) {
    try {
        const response: AxiosResponse = yield ApiService.callDelete(`accounts/${payload.body.id}`, {});
        yield put(removeAccountDetailsSuccess(response));
        performSuccessActions(payload);

    } catch (error: any) {
        error = error as AxiosError;
        performSuccessActions(payload);
        yield put(removeAccountDetailsError(error?.response?.data || {code: '400', description: 'Something went wrong'}));
    }
}

export function* watchGetAccount() {
    yield takeEvery(getAllAccount.type, getAccountDetails);
}

export function* watchUpdateAccountDetails() {
    yield takeEvery(updateAccountDetails.type, updateAccountDetail);
}

export function* watchRemoveAccountDetails() {
    yield takeEvery(removeAccountDetails.type, removeAccount);
}

export default function* rootSaga() {
    yield all([
        fork(watchGetAccount),
        fork(watchUpdateAccountDetails),
        fork(watchRemoveAccountDetails),
    ]);
}

