import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import {Account} from "@/models";
import {InitialAccountStateType} from "@/types";
import LocalStorageService from "@/utils/localstorage.service";

const initialState = {
    accounts: [],
    account: null,
    isLoading: false,
    error: null,
    selectedAccount: LocalStorageService.updateAccount('get') || null,
} as InitialAccountStateType

const accountSlice = createSlice({
    name: 'accounts',
    initialState,
    reducers: {
        getAllAccount: (state: InitialAccountStateType, action: PayloadAction<{}>) => {
            return {...state, accounts: [], isLoading: true, error: null}
        },
        getAllAccountSuccess: (state: InitialAccountStateType, {payload: accounts}: PayloadAction<{ accounts: Account[] }>) => {
            return {...state, accounts, isLoading: false, error: null}
        },
        getAllAccountError: (state: InitialAccountStateType, {payload: error}: PayloadAction<{ error: any }>) => {
            return {...state, accounts: [], isLoading: false, error}
        },
        updateAccountState: (state: InitialAccountStateType, action: PayloadAction<any>) => {
            return {...state, ...action.payload}
        },
    }
})

export const {
    getAllAccount,
    getAllAccountSuccess,
    getAllAccountError,
    updateAccountState
} = accountSlice.actions
export default accountSlice.reducer
