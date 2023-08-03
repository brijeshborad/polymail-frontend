import {combineReducers} from "redux";
import projects from './projects/action-reducer'
import auth from './auth/action-reducer'
import messages from './messages/action-reducer'
import threads from './threads/action-reducer'
import organizations from './organizations/action-reducer'
import accounts from './accounts/action-reducer'

const reducers = combineReducers({
    auth,
    projects,
    messages,
    threads,
    organizations,
    accounts
});
export default reducers;
