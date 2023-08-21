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
    getMessageAttachmentsSuccess,
    getMessageAttachmentsError,
    getMessageAttachments,
    getAttachmentDownloadUrl,
    getAttachmentDownloadUrlError, getAttachmentDownloadUrlSuccess, AddImageUrlError, AddImageUrlSuccess, AddImageUrl
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

function* sendDraftMessage({payload: {id, now, delay, undo}}: PayloadAction<{ id: string, now?: boolean, delay?: number, undo?: boolean }>) {
    try {
        const response: AxiosResponse = yield ApiService.callGet(`messages/${id}/send`,
            {
                ...(now ? {now}: {}),
                ...(delay ? {delay}: {}),
                ...(undo ? {undo}: {})
            });
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

function* getAttachmentUrl({payload: {id, attachment}}: PayloadAction<{ id: string, attachment: string }>) {
    try {
        const response: AxiosResponse = yield ApiService.callGet(`messages/${id}/attachments/${attachment}`, {});
        yield put(getAttachmentDownloadUrlSuccess(response));
    } catch (error: any) {
        error = error as AxiosError;
        yield put(getAttachmentDownloadUrlError(error.response.data));
    }
}

function* generateAttachmentUploadUrl({payload: {id, file}}: PayloadAction<{ id: string,
        file: File
     }>) {
    try {
        console.log(file);
        const {name, type} = file;
        const response: AxiosResponse = yield ApiService.callPost(`messages/${id}/attachments`, {filename: name, mimeType: type});

        // TODO: uncomment below code
        // if(response && response?.url) {
           // const response2: AxiosResponse = yield ApiService.callPut(response?.url, file, {"Content-Type": type, 'Skip-Headers': true});
        // }

        yield put(AddImageUrlSuccess(response));
    } catch (error: any) {
        error = error as AxiosError;
        yield put(AddImageUrlError(error.response.data));
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

export function* watchGetAttachmentUrl() {
    yield takeLatest(getAttachmentDownloadUrl.type, getAttachmentUrl);
}

export function* watchAddAttachmentUrlToS3() {
    yield takeLatest(AddImageUrl.type, generateAttachmentUploadUrl);
}


export default function* rootSaga() {
    yield all([
        fork(watchGetMessages),
        fork(watchGetMessagesPart),
        fork(watchCreateNewDraft),
        fork(watchSendDraftMessage),
        fork(watchUpdateCurrentDraftMessage),
        fork(watchGetMessagesAttachments),
        fork(watchGetAttachmentUrl),
        fork(watchAddAttachmentUrlToS3),
    ]);
}

