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
    uploadAttachment, updateMessageSuccess, updateMessageError, updateMessage, deleteMessage,
    removeAttachmentSuccess,
    removeAttachmentError, removeAttachment
} from "@/redux/messages/action-reducer";
import { ReducerActionType } from "@/types";
import { performSuccessActions } from "@/utils/common-redux.functions";

function* getMessages({payload}: PayloadAction<ReducerActionType>) {
    try {
        const response: AxiosResponse = yield ApiService.callGet(`messages`, {
            ...(payload.body.thread ? {thread: payload.body.thread} : {}),
        });
        performSuccessActions(payload);
        yield put(getAllMessagesSuccess(response));
    } catch (error: any) {
        error = error as AxiosError;
        yield put(getAllMessagesError(error?.response?.data || {code: '400', description: 'Something went wrong'}));
    }
}

function* getMessagePart({payload}: PayloadAction<ReducerActionType>) {
    try {
        const response: AxiosResponse = yield ApiService.callGet(`messages/${payload.body.id}/body`, null);
        performSuccessActions(payload);
        yield put(getMessagePartsSuccess({messagePart: response, id: payload.body.id}));
    } catch (error: any) {
        error = error as AxiosError;
        yield put(getMessagePartsError(error?.response?.data || {code: '400', description: 'Something went wrong'}));
    }
}

function* getMessageAttachment({payload}: PayloadAction<ReducerActionType>) {
    try {
        const response: AxiosResponse = yield ApiService.callGet(`messages/${payload.body.id}/attachments`, null);
        performSuccessActions(payload);
        yield put(getMessageAttachmentsSuccess({messageAttachments: response, id: payload.body.id}));
    } catch (error: any) {
        error = error as AxiosError;
        yield put(getMessageAttachmentsError(error?.response?.data || {code: '400', description: 'Something went wrong'}));
    }
}

function* getAttachmentUrl({payload}: PayloadAction<ReducerActionType>) {
    try {
        const response: AxiosResponse = yield ApiService.callGet(`messages/${payload.body.id}/attachments/${payload.body.attachment}`, {});
        performSuccessActions(payload);
        yield put(getAttachmentDownloadUrlSuccess(response));
    } catch (error: any) {
        error = error as AxiosError;
        yield put(getAttachmentDownloadUrlError(error?.response?.data || {code: '400', description: 'Something went wrong'}));
    }
}

function* generateAttachmentUploadUrl({payload}: PayloadAction<ReducerActionType>) {
    try {
        const {name, type} = payload.body.file;
        let response: AxiosResponse = yield ApiService.callPost(`messages/${payload.body.id}/attachments`, {
            filename: name,
            mimeType: type
        });

        if (response && (response as any)?.url) {
            yield ApiService.callPut((response as any)?.url, payload.body.file, {"Content-Type": type, 'Skip-Headers': true});
        }

        performSuccessActions(payload);
        yield put(uploadAttachmentSuccess(response));
    } catch (error: any) {
        error = error as AxiosError;
        yield put(uploadAttachmentError(error?.response?.data || {code: '400', description: 'Something went wrong'}));
    }
}

function* updateMessageData({payload}: PayloadAction<ReducerActionType>) {
    try {
        const response: AxiosResponse = yield ApiService.callPatch(`messages/${payload.body.id}`, payload.body.body);
        performSuccessActions(payload);
        yield put(updateMessageSuccess(response));
    } catch (error: any) {
        error = error as AxiosError;
        yield put(updateMessageError(error?.response?.data || {code: '400', description: 'Something went wrong'}));
    }
}

function* deleteMessageAPI({payload}: PayloadAction<ReducerActionType>) {
    try {
        yield ApiService.callDelete(`messages/${payload.body.id}`, {});
        performSuccessActions(payload);
    } catch (error: any) {
    }
}

function* removeAttachmentsData({payload}: PayloadAction<ReducerActionType>) {
    try {
        const response: AxiosResponse = yield ApiService.callDelete(`messages/${payload.body.id}/attachments/${payload.body.attachment}`, {});
        performSuccessActions(payload);
        yield put(removeAttachmentSuccess(response));
    } catch (error: any) {
        error = error as AxiosError;
        yield put(removeAttachmentError(error?.response?.data || {code: '400', description: 'Something went wrong'}));
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

export function* watchUpdateMessageData() {
    yield takeLatest(updateMessage.type, updateMessageData);
}

export function* watchDeleteMessage() {
    yield takeLatest(deleteMessage.type, deleteMessageAPI);
}

export function* watchRemoveAttachmentData() {
    yield takeLatest(removeAttachment.type, removeAttachmentsData);
}


export default function* rootSaga() {
    yield all([
        fork(watchGetMessages),
        fork(watchGetMessagesPart),
        fork(watchGetMessagesAttachments),
        fork(watchGetAttachmentUrl),
        fork(watchAddAttachmentUrlToS3),
        fork(watchUpdateMessageData),
        fork(watchDeleteMessage),
        fork(watchRemoveAttachmentData),
    ]);
}

