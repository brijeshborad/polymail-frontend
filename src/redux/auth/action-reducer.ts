import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import {InitialAuthState} from "@/types";
import LocalStorageService from "@/utils/localstorage.service";
// import {LoginWithGoogle} from "@/models";

const initialState = {
    user: LocalStorageService.updateUser('get') || null,
    isLoading: false,
    error: null,
    googleAuthRedirectionLink: null,
    isAuthenticated: !!(LocalStorageService.updateUser('get') || null)
} as InitialAuthState

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        loginUser: (state: InitialAuthState, action: PayloadAction<{ email: string, password: string }>) => {
            return {...state, user: undefined, error: null, isLoading: true, action}
        },
        loginSuccess: (state: InitialAuthState, {payload: user}: PayloadAction<{}>) => {
            return {...state, user, error: null, isLoading: false, isAuthenticated: true}
        },
        loginError: (state: InitialAuthState, {payload: error}: PayloadAction<any>) => {
            return {...state, user: undefined, error, isLoading: false}
        },
        registerUser: (state: InitialAuthState, action: PayloadAction<{ email: string, password: string }>) => {
            return {...state, user: undefined, error: null, isLoading: true, action}
        },
        registerSuccess: (state: InitialAuthState, {payload: user}: PayloadAction<{}>) => {
            return {...state, user, error: null, isLoading: false}
        },
        registerError: (state: InitialAuthState, {payload: error}: PayloadAction<any>) => {
            return {...state, user: undefined, error, isLoading: false}
        },
        logoutUser: (state: InitialAuthState) => {
            return {...state, user: undefined, error: null, isLoading: false}
        },
        logoutUserSuccess: (state: InitialAuthState) => {
            return {...state, user: undefined, error: null, isLoading: false, isAuthenticated: false}
        },
        logoutUserError: (state: InitialAuthState, {payload: error}: PayloadAction<any>) => {
            return {...state, error, isLoading: false}
        },
        googleAuthLink: (state: InitialAuthState, action: PayloadAction<{
            mode: string,
            redirectUrl: string,
            accountType: string,
            platform: string
        }>) => {
            return {...state, user: undefined, error: null, googleAuthRedirectionLink: null, isLoading: false, action}
        },
        googleAuthLinkSuccess: (state: InitialAuthState, {payload: googleAuthRedirectionLink}: PayloadAction<{}
            >) => {
            return {...state, user: undefined, error: null, googleAuthRedirectionLink, isLoading: false}
        },
        googleAuthLinkError: (state: InitialAuthState, {payload: error}: PayloadAction<any>) => {
            return {...state, user: undefined, error, googleAuthRedirectionLink: null, isLoading: false}
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
    logoutUserSuccess,
    logoutUserError,
    googleAuthLink,
    googleAuthLinkSuccess,
    googleAuthLinkError,
    updateAuthState
} = authSlice.actions
export default authSlice.reducer
