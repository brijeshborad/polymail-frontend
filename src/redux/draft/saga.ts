import {PayloadAction} from "@reduxjs/toolkit";
import {all, fork, put, takeLatest} from "@redux-saga/core/effects";
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
import {MessageDraft, MessageRequestBody} from "@/models";

function* createNewDraft({payload: {accountId, body}}: PayloadAction<{ accountId: string, body: MessageDraft }>) {
    try {
        const response: AxiosResponse = yield ApiService.callPost(`messages`, {accountId, ...body});
        yield put(createDraftSuccess(response));
    } catch (error: any) {
        error = error as AxiosError;
        yield put(createDraftError(error?.response?.data || {code: '400', description: 'Something went wrong'}));
    }
}

function* sendDraftMessage({
                               payload: {
                                   id,
                                   now,
                                   delay,
                                   undo
                               }
                           }: PayloadAction<{ id: string, now?: boolean, delay?: number, undo?: boolean }>) {
    try {
        const response: AxiosResponse = yield ApiService.callGet(`messages/${id}/send`,
            {
                ...(now ? {now} : {}),
                ...(delay ? {delay} : {}),
                ...(undo ? {undo} : {})
            });
        yield put(sendMessageSuccess(response || {}));
    } catch (error: any) {
        error = error as AxiosError;
        yield put(sendMessageError(error?.response?.data || {code: '400', description: 'Something went wrong'}));
    }
}

function* patchPartialMessage({payload: {id, body}}: PayloadAction<{ id: string, body: MessageRequestBody }>) {
    try {
        const response: AxiosResponse = yield ApiService.callPatch(`messages/${id}`, body);
        yield put(updatePartialMessageSuccess(response));
    } catch (error: any) {
        error = error as AxiosError;
        yield put(updatePartialMessageError(error?.response?.data || {code: '400', description: 'Something went wrong'}));
    }
}

export function* watchCreateNewDraft() {
    yield takeLatest(createDraft.type, createNewDraft);
}

export function* watchSendDraftMessage() {
    yield takeLatest(sendMessage.type, sendDraftMessage);
}

export function* watchUpdateCurrentDraftMessage() {
    yield takeLatest(updatePartialMessage.type, patchPartialMessage);
}


export default function* rootSaga() {
    yield all([
        fork(watchCreateNewDraft),
        fork(watchSendDraftMessage),
        fork(watchUpdateCurrentDraftMessage)
    ]);
}

