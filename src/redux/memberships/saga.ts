import {PayloadAction} from "@reduxjs/toolkit";
import {AxiosError, AxiosResponse} from "axios";
import ApiService from "@/utils/api.service";
import {all, fork, put, takeLatest} from "@redux-saga/core/effects";
import {
    addItemToGroup,
    addItemToGroupError,
    addItemToGroupSuccess,
} from "@/redux/memberships/action-reducer";
import {MembershipsRequestBody} from "@/models/memberships";

// Add Threads to Projects
function* addItemToGroupService({payload}: PayloadAction<MembershipsRequestBody>) {
    try {
        const response: AxiosResponse = yield ApiService.callPost(`memberships`, payload);
        yield put(addItemToGroupSuccess(response));
    } catch (error: any) {
        error = error as AxiosError;
        yield put(addItemToGroupError(error.response.data));
    }
}

export function* watchAddItemToGroup() {
    yield takeLatest(addItemToGroup.type, addItemToGroupService);
}

export default function* rootSaga() {
    yield all([
        fork(watchAddItemToGroup),
    ]);
}
