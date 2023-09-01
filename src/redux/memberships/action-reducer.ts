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

        // Adding threads to projects
        addItemToGroup: (state: InitialMembershipStateType, _action: PayloadAction<any>) => {
            return {...state, error: null, isLoading: false, success: false}
        },
        addItemToGroupSuccess: (state: InitialMembershipStateType, {payload: membership}: PayloadAction<{}>) => {
            return {...state, membership, error: null, isLoading: false, success: true}
        },
        addItemToGroupError: (state: InitialMembershipStateType, {payload: error}: PayloadAction<any>) => {
            return {...state, error, isLoading: false}
        }
    }
})


export const {
    addItemToGroup,
    addItemToGroupSuccess,
    addItemToGroupError,
} = membershipSlice.actions
export default membershipSlice.reducer
