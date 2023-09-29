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
            return {...state, isLoading: false, isThreadAddedToProjectSuccess: false}
        },
        addItemToGroupSuccess: (state: InitialMembershipStateType, {payload: membership}: PayloadAction<{}>) => {
            return {...state, membership, isLoading: false, isThreadAddedToProjectSuccess: true}
        },
        addItemToGroupError: (state: InitialMembershipStateType, _action: PayloadAction<any>) => {
            return {...state, isLoading: false, isThreadAddedToProjectSuccess: false}
        },

        // Delete members from project
        deleteMemberFromProject: (state: InitialMembershipStateType, _action: PayloadAction<ReducerActionType>) => {
            return {...state, isLoading: false, isProjectRemoveSuccess: false}
        },
        deleteMemberFromProjectSuccess: (state: InitialMembershipStateType, _action: PayloadAction<{}>) => {
            return {...state, isLoading: false, isProjectRemoveSuccess: true}
        },
        deleteMemberFromProjectError: (state: InitialMembershipStateType, _action: PayloadAction<any>) => {
            return {...state, isLoading: false, isProjectRemoveSuccess: false}
        },

        deleteMemberShipFromProject: (state: InitialMembershipStateType, _action: PayloadAction<ReducerActionType>) => {
            return {...state, isLoading: false, isProjectRemoveSuccess: false}
        },
        deleteMemberShipFromProjectSuccess: (state: InitialMembershipStateType, _action: PayloadAction<{}>) => {
            return {...state, isLoading: false, isProjectRemoveSuccess: true}
        },
        deleteMemberShipFromProjectError: (state: InitialMembershipStateType, _action: PayloadAction<any>) => {
            return {...state, isLoading: false, isProjectRemoveSuccess: false}
        },

        // Delete members from organization
        deleteMemberFromOrganization: (state: InitialMembershipStateType, _action: PayloadAction<ReducerActionType>) => {
            return {...state, isLoading: false, isOrganizationRemoveSuccess: false}
        },
        deleteMemberFromOrganizationSuccess: (state: InitialMembershipStateType, _action: PayloadAction<{}>) => {
            return {...state, error: null, isLoading: false, success: true, isOrganizationRemoveSuccess: true}
        },
        deleteMemberFromOrganizationError: (state: InitialMembershipStateType, _action: PayloadAction<any>) => {
            return {...state, isLoading: false, isOrganizationRemoveSuccess: false}
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
    deleteMemberShipFromProject, deleteMemberShipFromProjectSuccess, deleteMemberShipFromProjectError,
    deleteMemberFromOrganization, deleteMemberFromOrganizationSuccess, deleteMemberFromOrganizationError
} = membershipSlice.actions
export default membershipSlice.reducer
