import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import {InitialAuthState} from "@/types";

const initialState: any = {
    userDetails: null,
    isLoading: false,
    error: null,
} as InitialAuthState

const userSlice = createSlice({
    name: 'users',
    initialState,
    reducers: {
        updateUsersDetails: (state: InitialAuthState, _action: PayloadAction<{ firstName: string, lastName: string, middleName: string }>) => {
            return {...state, error: null, isLoading: false}
        },
        updateUsersDetailsSuccess: (state: InitialAuthState, {payload: userDetails}: PayloadAction<{}>) => {
            return {...state, userDetails, error: null, isLoading: false}
        },
        updateUsersDetailsError: (state: InitialAuthState, {payload: error}: PayloadAction<any>) => {
            return {...state, error, isLoading: false}
        },

        getUsersDetails: (state: InitialAuthState, _action: PayloadAction<{ }>) => {
            return {...state, userDetails: {}, error: null, isLoading: false}
        },
        getUsersDetailsSuccess: (state: InitialAuthState, {payload: userDetails}: PayloadAction<{}>) => {
            return {...state, userDetails, error: null, isLoading: false}
        },
        getUsersDetailsError: (state: InitialAuthState, {payload: error}: PayloadAction<any>) => {
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
