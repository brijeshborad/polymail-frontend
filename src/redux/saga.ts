import {all} from "@redux-saga/core/effects";
import authSagas from './auth/saga';
import organizationsSagas from './organizations/saga';
import projectsSagas from './projects/saga';
import threadsSagas from './threads/saga';
import messageSagas from './messages/saga';
import accountSagas from './accounts/saga';
import userSagas from './users/saga';

export default function* rootSaga() {
    yield all([
        authSagas(),
        projectsSagas(),
        threadsSagas(),
        messageSagas(),
        organizationsSagas(),
        accountSagas(),
        userSagas(),
    ]);
}
