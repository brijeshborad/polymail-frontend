import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import {InitialMembershipStateType} from "@/types";

const initialState: any = {
    membership: {},
    isLoading: false,
    error: null,
    success: false
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
        deleteMemberFromProject: (state: InitialMembershipStateType, _action: PayloadAction<{ id?: string}>) => {
            return {...state, error: null, isLoading: false, success: false}
        },
        deleteMemberFromProjectSuccess: (state: InitialMembershipStateType, _action: PayloadAction<{}>) => {
            return {...state, error: null, isLoading: false, success: false}
        },
        deleteMemberFromProjectError: (state: InitialMembershipStateType, {payload: error}: PayloadAction<{ error: any }>) => {
            return {...state, error, isLoading: false}
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
    deleteMemberFromProject, deleteMemberFromProjectSuccess, deleteMemberFromProjectError
} = membershipSlice.actions
export default membershipSlice.reducer
