import {AxiosError} from "axios";
import ApiService from "@/utils/api.service";
import {all, fork, put, takeLatest} from "@redux-saga/core/effects";
import {
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

function* getProjectSummaryData({payload: {id, mailbox}}: PayloadAction<{id: string, mailbox?: string}>) {
  try {
    const response: Summary = yield ApiService.callGet(`summary/project/${id}`, {...(mailbox ? {mailbox}: {}),});
    yield put(getAllThreadsSuccess(response.threads || []));
    yield put(getProjectSummarySuccess(response));
    yield put(getProjectByIdSuccess(response.project || {}));

  } catch (error: any) {
    error = error as AxiosError;
    yield put(getProjectSummaryError(error?.response?.data || {code: '400', description: 'Something went wrong'}));
  }
}


export function* watchGetSummary() {
  yield takeLatest(getSummary.type, getSummaryData);
}

export function* watchGetProjectsSummary() {
  yield takeLatest(getProjectSummary.type, getProjectSummaryData);
}

export default function* rootSaga() {
  yield all([
    fork(watchGetSummary),
    fork(watchGetProjectsSummary),
  ]);
}
