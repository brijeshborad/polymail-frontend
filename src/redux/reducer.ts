import {combineReducers} from "redux";
import projects from './projects/action-reducer'

const reducers = combineReducers({
    projects
});
export default reducers;
