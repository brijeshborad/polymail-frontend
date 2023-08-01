import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import {InitialAuthState} from "@/types";
import {getStoreLocal} from "@/utils/localstorage.service";

const initialState = {
    user: getStoreLocal('poly-user', true) || null,
    isLoading: false,
    error: null,
} as InitialAuthState

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        loginUser: (state: InitialAuthState, action: PayloadAction<null>) => {
            return {...state, user: null, error: null, isLoading: true}
        },
        loginSuccess: (state: InitialAuthState, {payload: user}: PayloadAction<any>) => {
            return {...state, user, error: null, isLoading: false}
        },
        loginError: (state: InitialAuthState, {payload: error}: PayloadAction<any>) => {
            return {...state, user: null, error, isLoading: false}
        },
        registerUser: (state: InitialAuthState, action: PayloadAction<null>) => {
            return {...state, user: null, error: null, isLoading: true}
        },
        registerSuccess: (state: InitialAuthState, {payload: user}: PayloadAction<any>) => {
            return {...state, user, error: null, isLoading: false}
        },
        registerError: (state: InitialAuthState, {payload: error}: PayloadAction<any>) => {
            return {...state, user: null, error, isLoading: false}
        },
        logoutUser: (state: InitialAuthState, action: PayloadAction<null>) => {
            return {...state, user: null, error: null, isLoading: false}
        }
    }
})

export const {loginUser, loginSuccess, loginError, registerUser, registerSuccess, registerError, logoutUser} = authSlice.actions
export default authSlice.reducer
