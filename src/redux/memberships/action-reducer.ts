import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import {InitialMembershipStateType, ReducerActionType} from "@/types";

const initialState: any = {
    membership: {},
    isLoading: false,
    error: null,
    success: false,
    isOrganizationRemoveSuccess: false,
    isProjectRemoveSuccess: false,
    isThreadAddedToProjectSuccess: false
} as InitialMembershipStateType;

const membershipSlice = createSlice({
    name: 'memberships',
    initialState,
    reducers: {
        // Adding members to projects
        addItemToGroup: (state: InitialMembershipStateType, _action: PayloadAction<ReducerActionType>) => {
            return {...state, isLoading: false}
        },
        addItemToGroupSuccess: (state: InitialMembershipStateType, {payload: membership}: PayloadAction<{}>) => {
            return {...state, membership, isLoading: false}
        },
        addItemToGroupError: (state: InitialMembershipStateType, _action: PayloadAction<any>) => {
            return {...state, isLoading: false}
        },

        // Delete members from project
        deleteMemberFromProject: (state: InitialMembershipStateType, _action: PayloadAction<ReducerActionType>) => {
            return {...state, isLoading: false}
        },
        deleteMemberFromProjectSuccess: (state: InitialMembershipStateType, _action: PayloadAction<{}>) => {
            return {...state, isLoading: false}
        },
        deleteMemberFromProjectError: (state: InitialMembershipStateType, _action: PayloadAction<any>) => {
            return {...state, isLoading: false}
        },

        deleteMembershipFromProject: (state: InitialMembershipStateType, _action: PayloadAction<ReducerActionType>) => {
            return {...state, isLoading: false}
        },
        deleteMembershipFromProjectSuccess: (state: InitialMembershipStateType, _action: PayloadAction<{}>) => {
            return {...state, isLoading: false}
        },
        deleteMembershipFromProjectError: (state: InitialMembershipStateType, _action: PayloadAction<any>) => {
            return {...state, isLoading: false}
        },

        // Delete members from organization
        deleteMemberFromOrganization: (state: InitialMembershipStateType, _action: PayloadAction<ReducerActionType>) => {
            return {...state, isLoading: false}
        },
        deleteMemberFromOrganizationSuccess: (state: InitialMembershipStateType, _action: PayloadAction<{}>) => {
            return {...state, error: null, isLoading: false, success: true}
        },
        deleteMemberFromOrganizationError: (state: InitialMembershipStateType, _action: PayloadAction<any>) => {
            return {...state, isLoading: false}
        },
        updateMembershipState: (state: InitialMembershipStateType, action: PayloadAction<InitialMembershipStateType>) => {
            return {...state, ...action.payload}
        }
    }
})


export const {
    addItemToGroup,
    addItemToGroupSuccess,
    addItemToGroupError, updateMembershipState,
    deleteMemberFromProject, deleteMemberFromProjectSuccess, deleteMemberFromProjectError,
    deleteMembershipFromProject, deleteMembershipFromProjectSuccess, deleteMembershipFromProjectError,
    deleteMemberFromOrganization, deleteMemberFromOrganizationSuccess, deleteMemberFromOrganizationError
} = membershipSlice.actions
export default membershipSlice.reducer
