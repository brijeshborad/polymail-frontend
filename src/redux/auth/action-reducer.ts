import { InitialAuthState, ReducerActionType } from "@/types";
import LocalStorageService from "@/utils/localstorage.service";
import { PayloadAction, createSlice } from "@reduxjs/toolkit";

const initialState = {
    user: LocalStorageService.updateUser('get') || null,
    isLoading: false,
    error: null,
    googleAuthRedirectionLink: null,
    passwordChangeSuccess: false,
    magicCodeSuccess: false,
    magicCodeResponse: null,
    passwordResetSuccess: false,
    refreshToken: 'pending',
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
        registerUser: (state: InitialAuthState, _action: PayloadAction<{ email: string, password: string, redirectUrl: string }>) => {
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
        googleAuthLink: (state: InitialAuthState, _action: PayloadAction<ReducerActionType>) => {
            return {...state, error: null, googleAuthRedirectionLink: null, isLoading: false}
        },
        googleAuthLinkSuccess: (state: InitialAuthState, {payload: googleAuthRedirectionLink}: PayloadAction<{}>) => {
            return {...state, googleAuthRedirectionLink, isLoading: false}
        },
        googleAuthLinkError: (state: InitialAuthState, _action: PayloadAction<any>) => {
            return {...state, googleAuthRedirectionLink: null, isLoading: false}
        },
        updateAuthState: (state: InitialAuthState, action: PayloadAction<InitialAuthState>) => {
            return {...state, ...action.payload}
        },
        changePassword: (state: InitialAuthState, _action: PayloadAction<ReducerActionType>) => {
            return {...state, isLoading: true}
        },
        changePasswordSuccess: (state: InitialAuthState) => {
            return {...state, isLoading: false}
        },
        changePasswordError: (state: InitialAuthState, _action: PayloadAction<any>) => {
            return {...state, isLoading: false}
        },

        forgotPassword: (state: InitialAuthState, _action: PayloadAction<ReducerActionType>) => {
            return {...state, isLoading: true,}
        },
        forgotPasswordSuccess: (state: InitialAuthState) => {
            return {...state, isLoading: false}
        },
        forgotPasswordError: (state: InitialAuthState, _action: PayloadAction<any>) => {
            return {...state, isLoading: false,}
        },

        resetPassword: (state: InitialAuthState, _action: PayloadAction<ReducerActionType>) => {
            return {...state, isLoading: true}
        },
        resetPasswordSuccess: (state: InitialAuthState) => {
            return {...state, isLoading: false}
        },
        resetPasswordError: (state: InitialAuthState,  _action: PayloadAction<any>) => {
            return {...state, isLoading: false}
        },

        authRefreshToken: (state: InitialAuthState, _action: PayloadAction<ReducerActionType>) => {
            return {...state, refreshToken: 'pending', isLoading: true}
        },
        authRefreshTokenSuccess: (state: InitialAuthState) => {
            return {...state, refreshToken: 'success', isLoading: false}
        },
        authRefreshTokenError: (state: InitialAuthState,  _action: PayloadAction<any>) => {
            return {...state, refreshToken: 'error', isLoading: false}
        },

        magicCode: (state: InitialAuthState, _action: PayloadAction<ReducerActionType>) => {
            return {...state, isLoading: true}
        },
        magicCodeSuccess: (state: InitialAuthState, {payload}: PayloadAction<ReducerActionType>) => {
            if (payload.body.magicCodeResponse && payload.body.magicCodeResponse.token) {
                LocalStorageService.updateUser('store', {passwordResetToken: payload.body.magicCodeResponse.token});

            }
            return {...state,magicCodeResponse: payload.body.magicCodeResponse, isLoading: false}
        },
        magicCodeError: (state: InitialAuthState,  _action: PayloadAction<any>) => {
            return {...state, isLoading: false}
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
    magicCodeError, authRefreshToken, authRefreshTokenSuccess, authRefreshTokenError
} = authSlice.actions
export default authSlice.reducer
