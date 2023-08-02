import {InitialProjectState, InitialAuthState, InitialMessageStateType, InitialThreadStateType} from "./";

export declare type StateType = {
    projects: InitialProjectState
    auth: InitialAuthState,
    threads: InitialThreadStateType,
    messages: InitialMessageStateType,
}
