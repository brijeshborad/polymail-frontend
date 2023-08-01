import {combineReducers} from "redux";
import projects from './projects/action-reducer'
import auth from './auth/action-reducer'

const reducers = combineReducers({
    auth,
    projects
});
export default reducers;
