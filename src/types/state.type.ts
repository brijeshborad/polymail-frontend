import {
    InitialAccountStateType,
    InitialAuthState,
    InitialMessageStateType,
    InitialOrganizationStateType,
    InitialProjectState,
    InitialThreadStateType,
    InitialSocketType,
} from "./";

export declare type StateType = {
    projects: InitialProjectState
    auth: InitialAuthState,
    threads: InitialThreadStateType,
    messages: InitialMessageStateType,
    organizations: InitialOrganizationStateType,
    accounts: InitialAccountStateType,
    socket: InitialSocketType,
    users: InitialAuthState,
}
