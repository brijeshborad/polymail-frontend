import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import {InitialAuthState} from "@/types";
import LocalStorageService from "@/utils/localstorage.service";

const initialState = {
    user: LocalStorageService.updateUser('get') || null,
    isLoading: false,
    error: null,
    googleAuthRedirectionLink: null,
    passwordChangeSuccess: false,
    magicCodeSuccess: false,
    magicCodeResponse: null
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
            return {...state, error: null, googleAuthRedirectionLink: null, isLoading: false}
        },
        googleAuthLinkSuccess: (state: InitialAuthState, {payload: googleAuthRedirectionLink}: PayloadAction<{}>) => {
            return {...state, error: null, googleAuthRedirectionLink, isLoading: false}
        },
        googleAuthLinkError: (state: InitialAuthState, {payload: error}: PayloadAction<any>) => {
            return {...state, error, googleAuthRedirectionLink: null, isLoading: false}
        },
        updateAuthState: (state: InitialAuthState, action: PayloadAction<InitialAuthState>) => {
            return {...state, ...action.payload}
        },
        changePassword: (state: InitialAuthState, _action: PayloadAction<{ password?: string, newPasswordOne: string, newPasswordTwo: string }>) => {
            return {...state, error: null, isLoading: true, passwordChangeSuccess: false}
        },
        changePasswordSuccess: (state: InitialAuthState) => {
            return {...state, error: null, isLoading: false, passwordChangeSuccess: true}
        },
        changePasswordError: (state: InitialAuthState, {payload: error}: PayloadAction<any>) => {
            return {...state, error, isLoading: false, passwordChangeSuccess: false}
        },

        forgotPassword: (state: InitialAuthState, _action: PayloadAction<{ email: string, url: string }>) => {
            return {...state, error: null, isLoading: true, passwordResetSuccess: false}
        },
        forgotPasswordSuccess: (state: InitialAuthState) => {
            return {...state, error: null, isLoading: false, passwordResetSuccess: true}
        },
        forgotPasswordError: (state: InitialAuthState, {payload: error}: PayloadAction<any>) => {
            return {...state, error, isLoading: false, passwordResetSuccess: false}
        },

        resetPassword: (state: InitialAuthState, _action: PayloadAction<{ Password: string, code: string }>) => {
            return {...state, error: null, isLoading: true, passwordResetSuccess: false}
        },
        resetPasswordSuccess: (state: InitialAuthState) => {
            return {...state, error: null, isLoading: false, passwordResetSuccess: true}
        },
        resetPasswordError: (state: InitialAuthState, {payload: error}: PayloadAction<any>) => {
            return {...state, error, isLoading: false, passwordResetSuccess: false}
        },

        magicCode: (state: InitialAuthState, _action: PayloadAction<{ code?: string }>) => {
            return {...state, error: null, isLoading: true, magicCodeSuccess: false}
        },
        magicCodeSuccess: (state: InitialAuthState, {payload: magicCodeResponse}: PayloadAction<any>) => {
            if (magicCodeResponse && magicCodeResponse.token) {
                LocalStorageService.updateUser('store', {passwordResetToken: magicCodeResponse.token});

            }
            return {...state,magicCodeResponse, error: null, isLoading: false, magicCodeSuccess: true}
        },
        magicCodeError: (state: InitialAuthState, {payload: error}: PayloadAction<any>) => {
            return {...state, error, isLoading: false, magicCodeSuccess: false}
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
    updateAuthState, changePassword, changePasswordError, changePasswordSuccess,
    forgotPassword,
    forgotPasswordSuccess,
    forgotPasswordError,
    resetPassword,
    resetPasswordSuccess,
    resetPasswordError,
    magicCode,
    magicCodeSuccess,
    magicCodeError
} = authSlice.actions
export default authSlice.reducer
