import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import {InitialAccountStateType} from "@/types";
import LocalStorageService from "@/utils/localstorage.service";

const initialState: any = {
    accounts: [],
    account: null,
    isLoading: false,
    error: null,
    selectedAccount: LocalStorageService.updateAccount('get') || null,
    success: false
} as InitialAccountStateType

const accountSlice = createSlice({
    name: 'accounts',
    initialState,
    reducers: {
        getAllAccount: (state: InitialAccountStateType) => {
            return {...state, accounts: [], isLoading: true, error: null}
        },
        getAllAccountSuccess: (state: InitialAccountStateType, {payload: accounts}: PayloadAction<{}>) => {
            return {...state, accounts, isLoading: false, error: null}
        },
        getAllAccountError: (state: InitialAccountStateType, {payload: error}: PayloadAction<any>) => {
            return {...state, accounts: [], isLoading: false, error}
        },
        updateAccountState: (state: InitialAccountStateType, action: PayloadAction<InitialAccountStateType>) => {
            return {...state, ...action.payload}
        },

        getSyncAccount: (state: InitialAccountStateType, _action: PayloadAction<{}>) => {
            return {...state, account: null, isLoading: true, error: null}
        },
        getSyncAccountSuccess: (state: InitialAccountStateType, {payload: account}: PayloadAction<{}>) => {
            return {...state, ...account, isLoading: false, error: null}
        },
        getSyncAccountError: (state: InitialAccountStateType, {payload: error}: PayloadAction<any>) => {
            return {...state, account: null, isLoading: false, error}
        },

        updateAccountDetails: (state: InitialAccountStateType, _action: PayloadAction<{ signature: string, id: string }>) => {
            return {...state, error: null, isLoading: false}
        },
        updateAccountDetailsSuccess: (state: InitialAccountStateType, {payload: account}: PayloadAction<{}>) => {
            LocalStorageService.updateAccount('store', account);
            return {...state, account, error: null, isLoading: false}
        },
        updateAccountDetailsError: (state: InitialAccountStateType, {payload: error}: PayloadAction<any>) => {
            return {...state, error, isLoading: false}
        },
    }
})

export const {
    getAllAccount,
    getAllAccountSuccess,
    getAllAccountError,
    updateAccountState,
    getSyncAccount,
    getSyncAccountSuccess,
    getSyncAccountError,
    updateAccountDetails,
    updateAccountDetailsSuccess,
    updateAccountDetailsError
} = accountSlice.actions
export default accountSlice.reducer
