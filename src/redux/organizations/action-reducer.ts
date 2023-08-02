import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import {InitialOrganizationStateType} from "@/types";
import {Organization} from "@/models";

const initialState = {
    organizations: [],
    organization: null,
    isLoading: false,
    error: null,
} as InitialOrganizationStateType

const organizationSlice = createSlice({
    name: 'organizations',
    initialState,
    reducers: {
        getAllOrganizations: (state: InitialOrganizationStateType, action: PayloadAction<{}>) => {
            return {...state, organizations: [], isLoading: true, error: null}
        },
        getAllOrganizationsSuccess: (state: InitialOrganizationStateType, {payload: organizations}: PayloadAction<{ organizations: Organization[] }>) => {
            return {...state, organizations, isLoading: false, error: null}
        },
        getAllOrganizationsError: (state: InitialOrganizationStateType, {payload: error}: PayloadAction<{ error: any }>) => {
            return {...state, organizations: [], isLoading: false, error}
        }
    }
})

export const {getAllOrganizations, getAllOrganizationsSuccess, getAllOrganizationsError} = organizationSlice.actions
export default organizationSlice.reducer
