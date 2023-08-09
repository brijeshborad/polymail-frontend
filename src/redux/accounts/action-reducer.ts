import {createSlice, PayloadAction} from "@reduxjs/toolkit";
// import {Account} from "@/models";
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

        getSyncAccount: (state: InitialAccountStateType, action: PayloadAction<{}>) => {
            return {...state, account: null, isLoading: true, error: null, action}
        },
        getSyncAccountSuccess: (state: InitialAccountStateType, {payload: account}: PayloadAction<{}>) => {
               return {...state, ...account, isLoading: false, error: null}
        },
        getSyncAccountError: (state: InitialAccountStateType, {payload: error}: PayloadAction<any>) => {
            return {...state, account: null, isLoading: false, error}
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
    getSyncAccountError
} = accountSlice.actions
export default accountSlice.reducer
