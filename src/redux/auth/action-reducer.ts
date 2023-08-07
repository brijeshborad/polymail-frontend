import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import {InitialAuthState} from "@/types";
import LocalStorageService from "@/utils/localstorage.service";
import {LoginWithGoogle, User} from "@/models";

const initialState = {
    user: LocalStorageService.updateUser('get') || null,
    isLoading: false,
    error: null,
    googleAuthRedirectionLink: null,
} as InitialAuthState

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        loginUser: (state: InitialAuthState) => {
            return {...state, user: null, error: null, isLoading: true}
        },
        loginSuccess: (state: InitialAuthState, {payload: user}: PayloadAction<{user: User}>) => {
            return {...state, user, error: null, isLoading: false}
        },
        loginError: (state: InitialAuthState, {payload: error}: PayloadAction<any>) => {
            return {...state, user: null, error, isLoading: false}
        },
        registerUser: (state: InitialAuthState) => {
            return {...state, user: null, error: null, isLoading: true}
        },
        registerSuccess: (state: InitialAuthState, {payload: user}: PayloadAction<{user: User}>) => {
            return {...state, user, error: null, isLoading: false}
        },
        registerError: (state: InitialAuthState, {payload: error}: PayloadAction<any>) => {
            return {...state, user: null, error, isLoading: false}
        },
        logoutUser: (state: InitialAuthState) => {
            return {...state, user: null, error: null, isLoading: false}
        },
        googleAuthLink: (state: InitialAuthState) => {
            return {...state, user: null, error: null, googleAuthRedirectionLink: null, isLoading: false}
        },
        googleAuthLinkSuccess: (state: InitialAuthState, {payload: googleAuthRedirectionLink}: PayloadAction<{loginWithGoogle: LoginWithGoogle}
            >) => {
            return {...state, user: null, error: null, googleAuthRedirectionLink, isLoading: false}
        },
        googleAuthLinkError: (state: InitialAuthState, {payload: error}: PayloadAction<any>) => {
            return {...state, user: null, error, googleAuthRedirectionLink: null, isLoading: false}
        },
        updateAuthState: (state: InitialAuthState, action: PayloadAction<InitialAuthState>) => {
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
