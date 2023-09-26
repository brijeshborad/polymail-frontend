import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import {InitialAccountStateType} from "@/types";
import LocalStorageService from "@/utils/localstorage.service";

const initialState: any = {
    accounts: [],
    account: null,
    isLoading: false,
    error: null,
    selectedAccount: LocalStorageService.updateAccount('get') || null,
    success: false,
    accountLoading: false
} as InitialAccountStateType
interface SuccessData {
    success: boolean;
    // Add other properties if there are any
}

const accountSlice = createSlice({
    name: 'accounts',
    initialState,
    reducers: {
        getAllAccount: (state: InitialAccountStateType) => {
            return {...state, accounts: [], isLoading: true, error: null}
        },
        getAllAccountSuccess: (state: InitialAccountStateType, {payload: accounts}: PayloadAction<{}>) => {
            return {...state, accounts, isLoading: false, error: null, success: true}
        },
        getAllAccountError: (state: InitialAccountStateType, {payload: error}: PayloadAction<any>) => {
            return {...state, accounts: [], isLoading: false, error}
        },

        updateAccountState: (state: InitialAccountStateType, action: PayloadAction<InitialAccountStateType>) => {
            return {...state, ...action.payload}
        },

        updateAccountDetails: (state: InitialAccountStateType, _action: PayloadAction<{ signature: string, id: string }>) => {
            return {...state, error: null, isLoading: false, success: false}
        },
        updateAccountDetailsSuccess: (state: InitialAccountStateType, {payload: account}: PayloadAction<{}>) => {
            LocalStorageService.updateAccount('store', account);
            return {...state, account, error: null, isLoading: false, success: true}
        },
        updateAccountDetailsError: (state: InitialAccountStateType, {payload: error}: PayloadAction<any>) => {
            return {...state, error, isLoading: false, success: false}
        },

        removeAccountDetails: (state: InitialAccountStateType, _action: PayloadAction<{ id: string }>) => {
            return {...state, error: null, isLoading: false}
        },
        removeAccountDetailsSuccess: (state: InitialAccountStateType, {payload: success}: PayloadAction<{}>) => {
            return {
                ...state,
                success: success && 'success' in success ? (success as SuccessData).success : false,
                error: null,
                isLoading: false
            };
        },
        removeAccountDetailsError: (state: InitialAccountStateType, {payload: error}: PayloadAction<any>) => {
            return {...state, error, isLoading: false}
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
