import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import {InitialAuthState} from "@/types";
import LocalStorageService from "@/utils/localstorage.service";

const initialState = {
    user: LocalStorageService.updateUser('get') || null,
    isLoading: false,
    error: null,
    googleAuthRedirectionLink: null,
    passwordChangeSuccess: false
} as InitialAuthState

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        loginUser: (state: InitialAuthState, _action: PayloadAction<{ email: string, password: string }>) => {
            return {...state, user: undefined, error: null, isLoading: true}
        },
        loginSuccess: (state: InitialAuthState, {payload: user}: PayloadAction<{}>) => {
            return {...state, user, error: null, isLoading: false}
        },
        loginError: (state: InitialAuthState, {payload: error}: PayloadAction<any>) => {
            return {...state, user: undefined, error, isLoading: false}
        },
        registerUser: (state: InitialAuthState, _action: PayloadAction<{ email: string, password: string }>) => {
            return {...state, user: undefined, error: null, isLoading: true}
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
        googleAuthLink: (state: InitialAuthState, _action: PayloadAction<{
            mode: string,
            redirectUrl: string,
            accountType: string,
            platform: string
        }>) => {
            return {...state, user: undefined, error: null, googleAuthRedirectionLink: null, isLoading: false}
        },
        googleAuthLinkSuccess: (state: InitialAuthState, {payload: googleAuthRedirectionLink}: PayloadAction<{}>) => {
            return {...state, user: undefined, error: null, googleAuthRedirectionLink, isLoading: false}
        },
        googleAuthLinkError: (state: InitialAuthState, {payload: error}: PayloadAction<any>) => {
            return {...state, user: undefined, error, googleAuthRedirectionLink: null, isLoading: false}
        },
        updateAuthState: (state: InitialAuthState, action: PayloadAction<InitialAuthState>) => {
            return {...state, ...action.payload}
        },
        changePassword: (state: InitialAuthState, _action: PayloadAction<{ password: string, newPasswordOne: string, newPasswordTwo: string }>) => {
            return {...state, error: null, isLoading: true, passwordChangeSuccess: false}
        },
        changePasswordSuccess: (state: InitialAuthState) => {
            return {...state, error: null, isLoading: false, passwordChangeSuccess: true}
        },
        changePasswordError: (state: InitialAuthState, {payload: error}: PayloadAction<any>) => {
            return {...state, error, isLoading: false, passwordChangeSuccess: false}
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
    updateAuthState, changePassword, changePasswordError, changePasswordSuccess
} = authSlice.actions
export default authSlice.reducer
