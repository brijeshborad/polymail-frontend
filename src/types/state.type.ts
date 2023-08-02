import {InitialProjectState, InitialAuthState, InitialMessageStateType, InitialThreadStateType, InitialOrganizationStateType} from "./";

export declare type StateType = {
    projects: InitialProjectState
    auth: InitialAuthState,
    threads: InitialThreadStateType,
    messages: InitialMessageStateType,
    organizations: InitialOrganizationStateType,
}
