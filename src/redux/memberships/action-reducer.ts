import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import {InitialMembershipStateType} from "@/types";

const initialState: any = {
    membership: {},
    isLoading: false,
    error: null,
    success: false,
    isOrganizationRemoveSuccess: false,
    isProjectRemoveSuccess: false,
} as InitialMembershipStateType;

const membershipSlice = createSlice({
    name: 'memberships',
    initialState,
    reducers: {
        // Adding members to projects
        addItemToGroup: (state: InitialMembershipStateType, _action: PayloadAction<any>) => {
            return {...state, error: null, isLoading: false, success: false}
        },
        addItemToGroupSuccess: (state: InitialMembershipStateType, {payload: membership}: PayloadAction<{}>) => {
            return {...state, membership, error: null, isLoading: false, success: true}
        },
        addItemToGroupError: (state: InitialMembershipStateType, {payload: error}: PayloadAction<any>) => {
            return {...state, error, isLoading: false}
        },

        // Delete members from project
        deleteMemberFromProject: (state: InitialMembershipStateType, _action: PayloadAction<{ id?: string, accountId?: string }>) => {
            return {...state, error: null, isLoading: false, success: false, isProjectRemoveSuccess: false}
        },
        deleteMemberFromProjectSuccess: (state: InitialMembershipStateType, _action: PayloadAction<{}>) => {
            return {...state, error: null, isLoading: false, success: true, isProjectRemoveSuccess: true}
        },
        deleteMemberFromProjectError: (state: InitialMembershipStateType, {payload: error}: PayloadAction<{ error: any }>) => {
            return {...state, error, isLoading: false, isProjectRemoveSuccess: false}
        },

        deleteMemberShipFromProject: (state: InitialMembershipStateType, _action: PayloadAction<{ id?: string}>) => {
            return {...state, error: null, isLoading: false, success: false, isProjectRemoveSuccess: false}
        },
        deleteMemberShipFromProjectSuccess: (state: InitialMembershipStateType, _action: PayloadAction<{}>) => {
            return {...state, error: null, isLoading: false, success: true, isProjectRemoveSuccess: true}
        },
        deleteMemberShipFromProjectError: (state: InitialMembershipStateType, {payload: error}: PayloadAction<{ error: any }>) => {
            return {...state, error, isLoading: false, isProjectRemoveSuccess: false}
        },

        // Delete members from organization
        deleteMemberFromOrganization: (state: InitialMembershipStateType, _action: PayloadAction<{ id?: string, accountId?: string }>) => {
            return {...state, error: null, isLoading: false, success: false, isOrganizationRemoveSuccess: false}
        },
        deleteMemberFromOrganizationSuccess: (state: InitialMembershipStateType, _action: PayloadAction<{}>) => {
            return {...state, error: null, isLoading: false, success: true, isOrganizationRemoveSuccess: true}
        },
        deleteMemberFromOrganizationError: (state: InitialMembershipStateType, {payload: error}: PayloadAction<{ error: any }>) => {
            return {...state, error, isLoading: false, isOrganizationRemoveSuccess: false}
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
