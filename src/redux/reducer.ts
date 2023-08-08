import {combineReducers} from "redux";
import {HYDRATE} from "next-redux-wrapper";
import projects from './projects/action-reducer'
import auth from './auth/action-reducer'
import messages from './messages/action-reducer'
import threads from './threads/action-reducer'
import organizations from './organizations/action-reducer'
import accounts from './accounts/action-reducer'

const combinedReducer = combineReducers({
    auth,
    projects,
    messages,
    threads,
    organizations,
    accounts
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
