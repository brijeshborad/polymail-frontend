import {combineReducers} from "redux";
import {HYDRATE} from "next-redux-wrapper";
import projects from './projects/action-reducer'
import auth from './auth/action-reducer'
import messages from './messages/action-reducer'
import threads from './threads/action-reducer'
import organizations from './organizations/action-reducer'
import accounts from './accounts/action-reducer'
import socket from './socket/action-reducer'
import draft from './draft/action-reducer'
import users from './users/action-reducer'
import memberships from './memberships/action-reducer'
import undoBody from './undo-body/action-reducer'
import commonApis from './common-apis/action-reducer'

const combinedReducer = combineReducers({
    auth,
    projects,
    messages,
    threads,
    organizations,
    accounts,
    socket,
    draft,
    users,
    memberships,
    undoBody,
    commonApis
});

const reducers = (state: any, action: any) => {
    if (action.type === HYDRATE) {
        return {
            ...state, // use previous state
            ...action.payload, // apply delta from hydration
        };
    } else {
        return combinedReducer(state, action);
    }
};
export default reducers;
