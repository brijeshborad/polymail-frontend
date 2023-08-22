import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import {InitialUserState} from "@/types";
import {UserDetails} from "@/models";

const initialState: any = {
    userDetails: {},
    isLoading: false,
    error: null,
} as InitialUserState;

const userSlice = createSlice({
    name: 'users',
    initialState,
    reducers: {
        updateUsersDetails: (state: InitialUserState, _action: PayloadAction<UserDetails>) => {
            return {...state, error: null, isLoading: false}
        },
        updateUsersDetailsSuccess: (state: InitialUserState, {payload: userDetails}: PayloadAction<{}>) => {
            return {...state, userDetails, error: null, isLoading: false}
        },
        updateUsersDetailsError: (state: InitialUserState, {payload: error}: PayloadAction<any>) => {
            return {...state, error, isLoading: false}
        },

        getUsersDetails: (state: InitialUserState, _action: PayloadAction<UserDetails>) => {
            return {...state, userDetails: {}, error: null, isLoading: false}
        },
        getUsersDetailsSuccess: (state: InitialUserState, {payload: userDetails}: PayloadAction<{}>) => {
            return {...state, userDetails, error: null, isLoading: false}
        },
        getUsersDetailsError: (state: InitialUserState, {payload: error}: PayloadAction<any>) => {
            return {...state, error, isLoading: false}
        },
    }
})


export const {
    updateUsersDetails,
    updateUsersDetailsSuccess,
    updateUsersDetailsError,
    getUsersDetails,
    getUsersDetailsSuccess,
    getUsersDetailsError
} = userSlice.actions
export default userSlice.reducer
