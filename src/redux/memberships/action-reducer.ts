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
        addThreadToProject: (state: InitialMembershipStateType, _action: PayloadAction<any>) => {
            return {...state, error: null, isLoading: false, success: false}
        },
        addThreadToProjectSuccess: (state: InitialMembershipStateType, {payload: membership}: PayloadAction<{}>) => {
            return {...state, membership, error: null, isLoading: false, success: true}
        },
        addThreadToProjectError: (state: InitialMembershipStateType, {payload: error}: PayloadAction<any>) => {
            return {...state, error, isLoading: false}
        }
    }
})


export const {
    addThreadToProject,
    addThreadToProjectSuccess,
    addThreadToProjectError
} = membershipSlice.actions
export default membershipSlice.reducer
