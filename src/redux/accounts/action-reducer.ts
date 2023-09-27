import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import {InitialAccountStateType, ReducerActionType} from "@/types";
import LocalStorageService from "@/utils/localstorage.service";

const initialState: any = {
    accounts: [],
    account: null,
    isLoading: false,
    selectedAccount: LocalStorageService.updateAccount('get') || null,
    accountLoading: false
} as InitialAccountStateType

const accountSlice = createSlice({
    name: 'accounts',
    initialState,
    reducers: {
        getAllAccount: (state: InitialAccountStateType, _action: PayloadAction<ReducerActionType>) => {
            return {...state, accounts: [], isLoading: true}
        },
        getAllAccountSuccess: (state: InitialAccountStateType, {payload: accounts}: PayloadAction<{}>) => {
            return {...state, accounts, isLoading: false}
        },
        getAllAccountError: (state: InitialAccountStateType, _action: PayloadAction<any>) => {
            return {...state, accounts: [], isLoading: false}
        },

        updateAccountState: (state: InitialAccountStateType, action: PayloadAction<InitialAccountStateType>) => {
            return {...state, ...action.payload}
        },

        updateAccountDetails: (state: InitialAccountStateType, _action: PayloadAction<ReducerActionType>) => {
            return {...state, isLoading: false}
        },
        updateAccountDetailsSuccess: (state: InitialAccountStateType, {payload: account}: PayloadAction<{}>) => {
            LocalStorageService.updateAccount('store', account);
            return {...state, account, isLoading: false}
        },
        updateAccountDetailsError: (state: InitialAccountStateType, _action: PayloadAction<any>) => {
            return {...state, isLoading: false}
        },

        removeAccountDetails: (state: InitialAccountStateType, _action: PayloadAction<ReducerActionType>) => {
            return {...state, isLoading: false}
        },
        removeAccountDetailsSuccess: (state: InitialAccountStateType, _action: PayloadAction<any>) => {
            return {
                ...state,
                isLoading: false
            };
        },
        removeAccountDetailsError: (state: InitialAccountStateType, _action: PayloadAction<any>) => {
            return {...state, isLoading: false}
        },
    }
})

export const {
    getAllAccount,
    getAllAccountSuccess,
    getAllAccountError,
    updateAccountState,
    updateAccountDetails,
    updateAccountDetailsSuccess,
    updateAccountDetailsError,
    removeAccountDetails,
    removeAccountDetailsSuccess,
    removeAccountDetailsError
} = accountSlice.actions
export default accountSlice.reducer
