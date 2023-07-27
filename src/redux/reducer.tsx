import {combineReducers} from "redux";
import projectReducer from './projects/action-reducer'

const reducers = combineReducers({
    projectReducer
});
export default reducers;
