import {AxiosError, AxiosResponse} from "axios";
import ApiService from "@/utils/api.service";
import {all, fork, put, takeEvery} from "@redux-saga/core/effects";
import {
    getActivityFeed,
    getActivityFeedError,
    getActivityFeedSuccess,
    getAllProjectRules,
    getAllProjectRulesError,
    getAllProjectRulesSuccess,
    getContacts,
    getContactsError,
    getContactsSuccess,
    getProjectSummary,
    getProjectSummaryError,
    getProjectSummarySuccess,
    getSummary,
    getSummaryError,
    getSummarySuccess,
    markActivityAsRead,
    markActivityAsReadError,
    markActivityAsReadSuccess
} from "@/redux/common-apis/action-reducer";
import {getProjectByIdSuccess} from "@/redux/projects/action-reducer";
import {getAllAccountSuccess} from "@/redux/accounts/action-reducer";
import {updateUserState} from "@/redux/users/action-reducer";
import {Summary} from "@/models/summary";
import {PayloadAction} from "@reduxjs/toolkit";
import {getAllThreadsSuccess} from "@/redux/threads/action-reducer";
import {ReducerActionType} from "@/types";
import {performSuccessActions} from "@/utils/common-redux.functions";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";

dayjs.extend(customParseFormat)

function* getSummaryData() {
    try {
        const response: Summary = yield ApiService.callGet(`summary/inbox`, null);
        yield put(getAllAccountSuccess(response.accounts || []));
        yield put(getActivityFeedSuccess(response.activities || []));
        yield put(updateUserState({userDetails: response.user || {}}));
        yield put(getSummarySuccess({}));
    } catch (error: any) {
        error = error as AxiosError;
        yield put(getSummaryError(error?.response?.data || {code: '400', description: 'Something went wrong'}));
    }
}

function* getProjectSummaryData({payload}: PayloadAction<ReducerActionType>) {
    try {
        const response: Summary = yield ApiService.callGet(`summary/project/${payload.body.id}`, {
            ...(payload.body.mailbox ? {mailbox: payload.body.mailbox} : {}),
            cutoff: dayjs().add(1, "day").format('YYYY-MM-DD'),
            count: 100
        });
        performSuccessActions(payload);
        yield put(getAllThreadsSuccess(response.threads || []));
        yield put(getProjectSummarySuccess(response));
        yield put(getProjectByIdSuccess(response.project || {}));

    } catch (error: any) {
        error = error as AxiosError;
        yield put(getProjectSummaryError(error?.response?.data || {code: '400', description: 'Something went wrong'}));
    }
}

function* getAllContacts() {
    try {
        const response: AxiosResponse = yield ApiService.callGet(`contacts`, null);
        let finalContacts = [...(response as any).filter((obj: any, index: number) => {
            return index === (response as any).findIndex((o: any) => obj.email.email === o.email.email);
        })];
        yield put(getContactsSuccess(finalContacts));
    } catch (error: any) {
        error = error as AxiosError;
        yield put(getContactsError(error?.response?.data || {code: '400', description: 'Something went wrong'}));
    }
}

function* getAllActivityFeed() {
    try {
        const response: AxiosResponse = yield ApiService.callGet(`activities`, null);
        yield put(getActivityFeedSuccess(response));
    } catch (error: any) {
        error = error as AxiosError;
        yield put(getActivityFeedError(error?.response?.data || {code: '400', description: 'Something went wrong'}));
    }
}

function* markAllActivityAsRead() {
    try {
        const response: AxiosResponse = yield ApiService.callPatch(`users`, {activitiesRead: true});
        yield put(markActivityAsReadSuccess(response));
    } catch (error: any) {
        error = error as AxiosError;
        yield put(markActivityAsReadError(error?.response?.data || {code: '400', description: 'Something went wrong'}));
    }
}

function* allProjectRules() {
    try {
        const response: AxiosResponse = yield ApiService.callGet(`rules`, {});
        yield put(getAllProjectRulesSuccess(response));
    } catch (error: any) {
        error = error as AxiosError;
        yield put(getAllProjectRulesError(error?.response?.data || {code: '400', description: 'Something went wrong'}));
    }
}


export function* watchGetSummary() {
    yield takeEvery(getSummary.type, getSummaryData);
}

export function* watchGetProjectsSummary() {
    yield takeEvery(getProjectSummary.type, getProjectSummaryData);
}

export function* watchGetAllContacts() {
    yield takeEvery(getContacts.type, getAllContacts);
}

export function* watchGetAllActivityFeed() {
    yield takeEvery(getActivityFeed.type, getAllActivityFeed);
}

export function* watchMarkActivityAsRead() {
    yield takeEvery(markActivityAsRead.type, markAllActivityAsRead);
}

export function* watchGetAllProjectRules() {
    yield takeEvery(getAllProjectRules.type, allProjectRules);
}

export default function* rootSaga() {
    yield all([
        fork(watchGetSummary),
        fork(watchGetProjectsSummary),
        fork(watchGetAllContacts),
        fork(watchGetAllActivityFeed),
        fork(watchMarkActivityAsRead),
        fork(watchGetAllProjectRules),
    ]);
}
