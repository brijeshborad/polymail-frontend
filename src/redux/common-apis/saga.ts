import {AxiosError} from "axios";
import ApiService from "@/utils/api.service";
import {all, fork, put, takeLatest} from "@redux-saga/core/effects";
import {getSummary, getSummaryError} from "@/redux/common-apis/action-reducer";
import {getAllProjectsSuccess} from "@/redux/projects/action-reducer";
import {getAllAccountSuccess} from "@/redux/accounts/action-reducer";
import {getAllOrganizationsSuccess} from "@/redux/organizations/action-reducer";
import {updateUsersDetailsSuccess} from "@/redux/users/action-reducer";
import {Summary} from "@/models/summary";

function* getSummaryData() {
  try {
    const response: Summary = yield ApiService.callGet(`summary/inbox`, {});
    yield put(getAllProjectsSuccess(response.projects || []));
    yield put(getAllAccountSuccess(response.accounts || []));
    yield put(getAllOrganizationsSuccess(response.organizations || []));
    yield put(updateUsersDetailsSuccess(response.user || {}));
  } catch (error: any) {
    error = error as AxiosError;
    yield put(getSummaryError(error?.response?.data || {code: '400', description: 'Something went wrong'}));
  }
}


export function* watchGetSummary() {
  yield takeLatest(getSummary.type, getSummaryData);
}

export default function* rootSaga() {
  yield all([
    fork(watchGetSummary),
  ]);
}
