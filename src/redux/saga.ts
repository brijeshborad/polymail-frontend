import {all} from "@redux-saga/core/effects";
import authSagas from './auth/saga';
import projectsSagas from './projects/saga';
import threadsSagas from './threads/saga';
import messageSagas from './messages/saga';

export default function* rootSaga() {
    yield all([
        authSagas(),
        projectsSagas(),
        threadsSagas(),
        messageSagas(),
    ]);
}
