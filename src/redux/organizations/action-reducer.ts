import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import {InitialOrganizationStateType} from "@/types";
import {Organization} from "@/models";
import LocalStorageService from "@/utils/localstorage.service";

const initialState = {
    organizations: [],
    organization: null,
    isLoading: false,
    error: null,
    selectedOrganization: LocalStorageService.updateOrg('get') || null,
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
        },
        addOrganization: (state: InitialOrganizationStateType, action: PayloadAction<{ name: string, accountId: string }>) => {
            return {...state, organization: null, error: null, isLoading: true}
        },
        addOrganizationSuccess: (state: InitialOrganizationStateType, {payload: organization}: PayloadAction<{organization: Organization}>) => {
            return {...state, organization, error: null, isLoading: false}
        },
        addOrganizationError: (state: InitialOrganizationStateType, {payload: error}: PayloadAction<{ error: any }>) => {
            return {...state, organization: null, error, isLoading: false}
        },
        updateOrganizationState: (state: InitialOrganizationStateType, action: PayloadAction<InitialOrganizationStateType>) => {
            return {...state, ...action.payload}
        },
    }
})

export const {
    getAllOrganizations,
    getAllOrganizationsSuccess,
    getAllOrganizationsError,
    addOrganization,
    addOrganizationSuccess,
    addOrganizationError,
    updateOrganizationState
} = organizationSlice.actions
export default organizationSlice.reducer
