import {
    InitialAccountStateType,
    InitialAuthState,
    InitialMessageStateType,
    InitialOrganizationStateType,
    InitialProjectState,
    InitialThreadStateType,
    InitialSocketType,
    InitialDraftStateType,
    InitialUserState, InitialMembershipStateType,
    InitialUndoBodyType
} from "./";

export declare type StateType = {
    projects: InitialProjectState
    auth: InitialAuthState,
    threads: InitialThreadStateType,
    messages: InitialMessageStateType,
    organizations: InitialOrganizationStateType,
    accounts: InitialAccountStateType,
    socket: InitialSocketType,
    draft: InitialDraftStateType,
    users: InitialUserState,
    memberships: InitialMembershipStateType,
    undoBody: InitialUndoBodyType,
}
