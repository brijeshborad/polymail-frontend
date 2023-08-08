import {
    InitialAccountStateType,
    InitialAuthState,
    InitialMessageStateType,
    InitialOrganizationStateType,
    InitialProjectState,
    InitialThreadStateType
} from "./";

export declare type StateType = {
    projects: InitialProjectState
    auth: InitialAuthState,
    threads: InitialThreadStateType,
    messages: InitialMessageStateType,
    organizations: InitialOrganizationStateType,
    accounts: InitialAccountStateType,
}
