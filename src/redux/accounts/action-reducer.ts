import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import {Account} from "@/models";
import {InitialAccountStateType} from "@/types/account/account-state.type";

const initialState = {
    accounts: [],
    account: null,
    isLoading: false,
    error: null,
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
    }
})

export const {
    getAllAccount,
    getAllAccountSuccess,
    getAllAccountError
} = accountSlice.actions
export default accountSlice.reducer
