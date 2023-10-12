import {AxiosError, AxiosResponse} from "axios";
import ApiService from "@/utils/api.service";
import {all, fork, put, takeLatest} from "@redux-saga/core/effects";
import {
  getActivityFeed, getActivityFeedError, getActivityFeedSuccess,
  getContacts, getContactsError, getContactsSuccess,
  getProjectSummary,
  getProjectSummaryError, getProjectSummarySuccess,
  getSummary,
  getSummaryError, getSummarySuccess
} from "@/redux/common-apis/action-reducer";
import {getAllProjectsSuccess, getProjectByIdSuccess} from "@/redux/projects/action-reducer";
import {getAllAccountSuccess} from "@/redux/accounts/action-reducer";
import {getAllOrganizationsSuccess} from "@/redux/organizations/action-reducer";
import {updateUserState} from "@/redux/users/action-reducer";
import {Summary} from "@/models/summary";
import {PayloadAction} from "@reduxjs/toolkit";
import {getAllThreadsSuccess} from "@/redux/threads/action-reducer";
import { ReducerActionType } from "@/types";
import { performSuccessActions } from "@/utils/common-redux.functions";

function* getSummaryData() {
  try {
    const response: Summary = yield ApiService.callGet(`summary/inbox`, {});
    yield put(getAllProjectsSuccess(response.projects || []));
    yield put(getAllAccountSuccess(response.accounts || []));
    yield put(getAllOrganizationsSuccess(response.organizations || []));
    yield put(updateUserState({userDetails: response.user || {}}));
    yield put(getSummarySuccess({}));
  } catch (error: any) {
    error = error as AxiosError;
    yield put(getSummaryError(error?.response?.data || {code: '400', description: 'Something went wrong'}));
  }
}

function* getProjectSummaryData({payload}: PayloadAction<ReducerActionType>) {
  try {
    const response: Summary = yield ApiService.callGet(`summary/project/${payload.body.id}`, {...(payload.body.mailbox ? {mailbox: payload.body.mailbox}: {}),});
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


export function* watchGetSummary() {
  yield takeLatest(getSummary.type, getSummaryData);
}

export function* watchGetProjectsSummary() {
  yield takeLatest(getProjectSummary.type, getProjectSummaryData);
}

export function* watchGetAllContacts() {
  yield takeLatest(getContacts.type, getAllContacts);
}

export function* watchGetAllActivityFeed() {
  yield takeLatest(getActivityFeed.type, getAllActivityFeed);
}

export default function* rootSaga() {
  yield all([
    fork(watchGetSummary),
    fork(watchGetProjectsSummary),
    fork(watchGetAllContacts),
    fork(watchGetAllActivityFeed),
  ]);
}
