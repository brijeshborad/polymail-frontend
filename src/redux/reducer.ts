import {combineReducers} from "redux";
import projects from './projects/action-reducer'
import auth from './auth/action-reducer'
import messages from './messages/action-reducer'
import threads from './threads/action-reducer'
import organizations from './organizations/action-reducer'
import accounts from './accounts/action-reducer'
import {HYDRATE} from "next-redux-wrapper";

const combinedReducer = combineReducers({
    auth,
    projects,
    messages,
    threads,
    organizations,
    accounts
});

const reducers = (state, action) => {
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
