import {PayloadAction} from "@reduxjs/toolkit";
import {all, fork, put, takeEvery} from "@redux-saga/core/effects";
import ApiService from "@/utils/api.service";
import {AxiosError, AxiosResponse} from "axios";
import {
    createDraft,
    createDraftSuccess,
    createDraftError,
    sendMessage,
    sendMessageSuccess,
    sendMessageError,
    updatePartialMessageSuccess,
    updatePartialMessageError,
    updatePartialMessage
} from "@/redux/draft/action-reducer";
import { ReducerActionType } from "@/types";
import { performSuccessActions } from "@/utils/common-redux.functions";

function* createNewDraft({payload}: PayloadAction<ReducerActionType>) {
    const isForCompose = payload.body.fromCompose;
    const isDraftTab = payload.body.isDraftTab;
    try {
        delete payload.body.fromCompose;
        delete payload.body.isDraftTab;
        const response: AxiosResponse = yield ApiService.callPost(`messages`, {accountId: payload.body.accountId, ...payload.body.body});
        yield put(createDraftSuccess({draft: response, isForCompose, isDraftTab}));
    } catch (error: any) {
        error = error as AxiosError;
        yield put(createDraftError({error: error?.response?.data || {code: '400', description: 'Something went wrong'}, isForCompose, isDraftTab}));
    }
}

function* sendDraftMessage({payload}: PayloadAction<ReducerActionType>) {
    try {
        const response: AxiosResponse = yield ApiService.callGet(`messages/${payload.body.id}/send`,
            {
                ...(payload.body.now ? {now: payload.body.now} : {}),
                ...(payload.body.delay ? {delay: payload.body.delay} : {}),
                ...(payload.body.undo ? {undo: payload.body.undo} : {})
            });
        performSuccessActions(payload);
        yield put(sendMessageSuccess(response || {}));
    } catch (error: any) {
        error = error as AxiosError;
        yield put(sendMessageError(error?.response?.data || {code: '400', description: 'Something went wrong'}));
    }
}

function* patchPartialMessage({payload}: PayloadAction<ReducerActionType>) {
    const isForCompose = payload.body.fromCompose;
    const isDraftTab = payload.body.isDraftTab;
    try {
        delete payload.body.fromCompose;
        delete payload.body.isDraftTab;
        const response: AxiosResponse = yield ApiService.callPatch(`messages/${payload.body.id}`, payload.body.body);
        performSuccessActions(payload);
        yield put(updatePartialMessageSuccess({updatedDraft: response, isForCompose, isDraftTab}));
    } catch (error: any) {
        error = error as AxiosError;
        yield put(updatePartialMessageError(error?.response?.data || {code: '400', description: 'Something went wrong'}));
    }
}

export function* watchCreateNewDraft() {
    yield takeEvery(createDraft.type, createNewDraft);
}

export function* watchSendDraftMessage() {
    yield takeEvery(sendMessage.type, sendDraftMessage);
}

export function* watchUpdateCurrentDraftMessage() {
    yield takeEvery(updatePartialMessage.type, patchPartialMessage);
}


export default function* rootSaga() {
    yield all([
        fork(watchCreateNewDraft),
        fork(watchSendDraftMessage),
        fork(watchUpdateCurrentDraftMessage)
    ]);
}

