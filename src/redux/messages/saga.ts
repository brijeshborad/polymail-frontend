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
    getMessageAttachmentsSuccess,
    getMessageAttachmentsError,
    getMessageAttachments,
    getAttachmentDownloadUrl,
    getAttachmentDownloadUrlError,
    getAttachmentDownloadUrlSuccess,
    uploadAttachmentError,
    uploadAttachmentSuccess,
    uploadAttachment
} from "@/redux/messages/action-reducer";

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

function* getAttachmentUrl({payload: {id, attachment}}: PayloadAction<{ id: string, attachment: string }>) {
    try {
        const response: AxiosResponse = yield ApiService.callGet(`messages/${id}/attachments/${attachment}`, {});
        yield put(getAttachmentDownloadUrlSuccess(response));
    } catch (error: any) {
        error = error as AxiosError;
        yield put(getAttachmentDownloadUrlError(error.response.data));
    }
}

function* generateAttachmentUploadUrl({payload: {id, file}}: PayloadAction<{
    id: string,
    file: File
}>) {
    try {
        const {name, type} = file;
        let response: AxiosResponse = yield ApiService.callPost(`messages/${id}/attachments`, {
            filename: name,
            mimeType: type
        });

        if (response && (response as any)?.url) {
            yield ApiService.callPut((response as any)?.url, file, {"Content-Type": type, 'Skip-Headers': true});
        }

        yield put(uploadAttachmentSuccess(response));
    } catch (error: any) {
        error = error as AxiosError;
        yield put(uploadAttachmentError(error.response.data));
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

export function* watchGetAttachmentUrl() {
    yield takeLatest(getAttachmentDownloadUrl.type, getAttachmentUrl);
}

export function* watchAddAttachmentUrlToS3() {
    yield takeLatest(uploadAttachment.type, generateAttachmentUploadUrl);
}


export default function* rootSaga() {
    yield all([
        fork(watchGetMessages),
        fork(watchGetMessagesPart),
        fork(watchGetMessagesAttachments),
        fork(watchGetAttachmentUrl),
        fork(watchAddAttachmentUrlToS3),
    ]);
}

