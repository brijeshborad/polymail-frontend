import {InitialProjectState, InitialAuthState, InitialMessageStateType, InitialThreadStateType, InitialOrganizationStateType, InitialAccountStateType, InitialMessagePartType} from "./";

export declare type StateType = {
    projects: InitialProjectState
    auth: InitialAuthState,
    threads: InitialThreadStateType,
    messages: InitialMessageStateType,
    organizations: InitialOrganizationStateType,
    accounts: InitialAccountStateType,
    messagePart: InitialMessagePartType,
}
