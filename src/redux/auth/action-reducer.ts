import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import {InitialAuthState, InitialOrganizationStateType} from "@/types";
import {getStoreLocal} from "@/utils/localstorage.service";
import {Account, Organization} from "@/models";
import {InitialAccountStateType} from "@/types/account/account-state.type";

const initialState = {
    user: getStoreLocal('poly-user', true) || null,
    isLoading: false,
    error: null,
    googleAuthRedirectionLink: null,
} as InitialAuthState

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        loginUser: (state: InitialAuthState, action: PayloadAction<{ email: string, password: string }>) => {
            return {...state, user: null, error: null, isLoading: true}
        },
        loginSuccess: (state: InitialAuthState, {payload: user}: PayloadAction<any>) => {
            return {...state, user, error: null, isLoading: false}
        },
        loginError: (state: InitialAuthState, {payload: error}: PayloadAction<any>) => {
            return {...state, user: null, error, isLoading: false}
        },
        registerUser: (state: InitialAuthState, action: PayloadAction<{ email: string, password: string }>) => {
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
        },
        googleAuthLink: (state: InitialAuthState, action: PayloadAction<{ mode: string,
            redirectUrl: string
            accountType: string
            platform: string }>) => {
            return {...state, user: null, error: null, googleAuthRedirectionLink: null, isLoading: false}
        },
        googleAuthLinkSuccess: (state: InitialAuthState, {payload: googleAuthRedirectionLink}: PayloadAction<any>) => {
            return {...state, user: null, error: null, googleAuthRedirectionLink, isLoading: false}
        },
        googleAuthLinkError: (state: InitialAuthState, {payload: error}: PayloadAction<any>) => {
            return {...state, user: null, error, googleAuthRedirectionLink: null, isLoading: false}
        },
        updateAuthState: (state: InitialAuthState, action: PayloadAction<any>) => {
            return {...state, ...action.payload}
        },
    }
})

export const {
    loginUser,
    loginSuccess,
    loginError,
    registerUser,
    registerSuccess,
    registerError,
    logoutUser,
    googleAuthLink,
    googleAuthLinkSuccess,
    googleAuthLinkError,
    updateAuthState
} = authSlice.actions
export default authSlice.reducer
