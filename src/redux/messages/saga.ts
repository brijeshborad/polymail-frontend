import {PayloadAction} from "@reduxjs/toolkit";
import {all, fork, put, takeLatest} from "@redux-saga/core/effects";
import ApiService from "@/utils/api.service";
import {AxiosError, AxiosResponse} from "axios";
import {
    getAllMessages,
    getAllMessagesError,
    getAllMessagesSuccess,
    getMessageParts,
    getMessagePartsError,
    getMessagePartsSuccess,
    createDraft,
    createDraftSuccess,
    createDraftError,
    sendMessage,
    sendMessageSuccess,
    sendMessageError,
    updatePartialMessage,
    updateCurrentDraftSuccess,
    updateCurrentDraftError, updatePartialMessageSuccess, updatePartialMessageError
} from "@/redux/messages/action-reducer";
import {MessageRequestBody} from "@/models";

function* getMessages({payload: {thread}}: PayloadAction<{ thread?: string }>) {
    try {
        const response: AxiosResponse = yield ApiService.callGet(`messages`, {
            ...(thread ? {thread} : {}),
        });
        yield put(getAllMessagesSuccess(response));
    } catch (error: AxiosError | any) {
        yield put(getAllMessagesError(error.response.data));
    }
}

function* getMessagePart({payload: {id}}: PayloadAction<{ id: string }>) {
    try {
        const response: AxiosResponse = yield ApiService.callGet(`messages/${id}/parts`, null);
        yield put(getMessagePartsSuccess(response));
    } catch (error: AxiosError | any) {
        yield put(getMessagePartsError(error.response.data));
    }
}

function* createNewDraft({payload: {id}}: PayloadAction<{ id: string }>) {
    try {
        const response: AxiosResponse = yield ApiService.callPost(`messages`, {
            account: id,
        });
        yield put(createDraftSuccess(response));
    } catch (error: AxiosError | any) {
        yield put(createDraftError(error.response.data));
    }
}

function* updateCurrentDrafts({payload: {id, body}}: PayloadAction<{ id: string, body: object }>) {
    try {
        let newBody = body.body
        const response: AxiosResponse = yield ApiService.callPatch(`messages/${id}`, {
            newBody,
        });
        yield put(updateCurrentDraftSuccess(response));
    } catch (error: AxiosError | any) {
        yield put(updateCurrentDraftError(error.response.data));
    }
}

function* patchPartialMessage({payload: {id, body}}: PayloadAction<{ id: string, body: MessageRequestBody }>) {
    try {
        const response: AxiosResponse = yield ApiService.callPatch(`messages/${id}`, body);
        yield put(updatePartialMessageSuccess(response));
    } catch (error: AxiosError | any) {
        yield put(updatePartialMessageError(error.response.data));
    }
}

function* sendDraftMessage({payload: {id}}: PayloadAction<{ id: string }>) {
    try {
        const response: AxiosResponse = yield ApiService.callGet(`messages/${id}/send`, null);
        yield put(sendMessageSuccess(response));
    } catch (error: AxiosError | any) {
        yield put(sendMessageError(error.response.data));
    }
}

export function* watchGetMessages() {
    yield takeLatest(getAllMessages.type, getMessages);
}

export function* watchGetMessagesPart() {
    yield takeLatest(getMessageParts.type, getMessagePart);
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
        fork(watchGetMessages),
        fork(watchGetMessagesPart),
        fork(watchCreateNewDraft),
        fork(watchSendDraftMessage),
        fork(watchUpdateCurrentDraftMessage),
    ]);
}

