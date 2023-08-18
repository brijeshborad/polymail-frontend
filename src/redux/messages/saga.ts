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
    updatePartialMessageSuccess,
    updatePartialMessageError,
    updatePartialMessage,
    getMessageAttachmentsSuccess, getMessageAttachmentsError, getMessageAttachments
} from "@/redux/messages/action-reducer";
import {MessageDraft, MessageRequestBody} from "@/models";

function* getMessages({payload: {thread}}: PayloadAction<{ thread?: string }>) {
    try {
        const response: AxiosResponse = yield ApiService.callGet(`messages`, {
            ...(thread ? {thread} : {}),
        });
        yield put(getAllMessagesSuccess(response));
    } catch (error: any) {
        error = error as AxiosError;
        yield put(getAllMessagesError(error.response.data));
    }
}

function* getMessagePart({payload: {id}}: PayloadAction<{ id: string }>) {
    try {
        const response: AxiosResponse = yield ApiService.callGet(`messages/${id}/body`, null);
        yield put(getMessagePartsSuccess(response));
    } catch (error: any) {
        error = error as AxiosError;
        yield put(getMessagePartsError(error.response.data));
    }
}

function* getMessageAttachment({payload: {id}}: PayloadAction<{ id: string }>) {
    try {
        const response: AxiosResponse = yield ApiService.callGet(`messages/${id}/attachments`, null);
        yield put(getMessageAttachmentsSuccess(response));
    } catch (error: any) {
        error = error as AxiosError;
        yield put(getMessageAttachmentsError(error.response.data));
    }
}

function* createNewDraft({payload: {accountId, body}}: PayloadAction<{accountId: string, body: MessageDraft }>) {
    try {
        const response: AxiosResponse = yield ApiService.callPost(`messages`, {accountId, ...body});
        yield put(createDraftSuccess(response));
    } catch (error: any) {
        error = error as AxiosError;
        yield put(createDraftError(error.response.data));
    }
}

function* sendDraftMessage({payload: {id}}: PayloadAction<{ id: string }>) {
    try {
        const response: AxiosResponse = yield ApiService.callGet(`messages/${id}/send`, null);
        yield put(sendMessageSuccess(response || {}));
    } catch (error: any) {
        error = error as AxiosError;
        yield put(sendMessageError(error.response.data));
    }
}

function* patchPartialMessage({payload: {id, body}}: PayloadAction<{ id: string, body: MessageRequestBody }>) {
    try {
        const response: AxiosResponse = yield ApiService.callPatch(`messages/${id}`, body);
        yield put(updatePartialMessageSuccess(response));
    } catch (error: any) {
        error = error as AxiosError;

        yield put(updatePartialMessageError(error.response.data));
    }
}

export function* watchGetMessages() {
    yield takeLatest(getAllMessages.type, getMessages);
}

export function* watchGetMessagesPart() {
    yield takeLatest(getMessageParts.type, getMessagePart);
}

export function* watchGetMessagesAttachments() {
    yield takeLatest(getMessageAttachments.type, getMessageAttachment);
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
        fork(watchGetMessagesAttachments),
    ]);
}

