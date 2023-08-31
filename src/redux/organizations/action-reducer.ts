import {createSlice, current, PayloadAction} from "@reduxjs/toolkit";
import {InitialOrganizationStateType} from "@/types";
import LocalStorageService from "@/utils/localstorage.service";
import {Organization} from "@/models";

const initialState: any = {
    organizations: [],
    organization: null,
    isLoading: false,
    error: null,
    selectedOrganization: LocalStorageService.updateOrg('get') || null,
    members: [],
    isRemoveOrganization: false,
    isOrganizationAddOrRemoveSuccess: false,
    success: false
} as InitialOrganizationStateType

interface SuccessData {
    success: boolean;
    // Add other properties if there are any
}

const organizationSlice = createSlice({
    name: 'organizations',
    initialState,
    reducers: {
        getAllOrganizations: (state: InitialOrganizationStateType) => {
            return {...state, organizations: [], isLoading: true, error: null}
        },
        getAllOrganizationsSuccess: (state: InitialOrganizationStateType, {payload: organizations}: PayloadAction<{}>) => {
            let organizationArray = [...organizations as Organization[]]
            organizations = (organizationArray || []).sort((a: Organization, b: Organization) => (new Date(b.created as string).valueOf() - new Date(a.created as string).valueOf()));

            return {...state, organizations, isLoading: false, error: null}
        },
        getAllOrganizationsError: (state: InitialOrganizationStateType, {payload: error}: PayloadAction<{ error: any }>) => {
            return {...state, organizations: [], isLoading: false, error}
        },

        getOrganizationMembers: (state: InitialOrganizationStateType, _action: PayloadAction<{ orgId: string }>) => {
            return {...state, members: [], isLoading: true, error: null}
        },
        getOrganizationMembersSuccess: (state: InitialOrganizationStateType, {payload: members}: PayloadAction<{}>) => {
            return {...state, members, isLoading: false, error: null}
        },
        getOrganizationMembersError: (state: InitialOrganizationStateType, {payload: error}: PayloadAction<{ error: any }>) => {
            return {...state, members: [], isLoading: false, error}
        },

        addOrganization: (state: InitialOrganizationStateType, _action: PayloadAction<{ name?: string, accountId?: string }>) => {
            return {...state, organization: null, error: null, isLoading: true, isOrganizationAddOrRemoveSuccess: false}
        },
        addOrganizationSuccess: (state: InitialOrganizationStateType, {payload: organization}: PayloadAction<{}>) => {
            let currentOrganizations = [...(current(state).organizations || [])] as Organization[];
            return {
                ...state,
                organizations: [organization, ...currentOrganizations],
                organization,
                isLoading: false,
                error: null,
                isOrganizationAddOrRemoveSuccess: true
            }
        },
        addOrganizationError: (state: InitialOrganizationStateType, {payload: error}: PayloadAction<{ error: any }>) => {
            return {...state, organization: null, error, isLoading: false, isOrganizationAddOrRemoveSuccess: false}
        },

        editOrganization: (state: InitialOrganizationStateType, _action: PayloadAction<{ id?: string, body?: Organization }>) => {
            return {...state, organization: null, error: null, isLoading: true, isOrganizationAddOrRemoveSuccess: false}
        },
        editOrganizationSuccess: (state: InitialOrganizationStateType, {payload: organization}: PayloadAction<{}>) => {
            LocalStorageService.updateOrg('store', organization);

            return {
                ...state,
                organization,
                isLoading: false,
                error: null,
                isOrganizationAddOrRemoveSuccess: true
            }
        },
        editOrganizationError: (state: InitialOrganizationStateType, {payload: error}: PayloadAction<{ error: any }>) => {
            return {...state, organization: null, error, isLoading: false, isOrganizationAddOrRemoveSuccess: false}
        },

        removeOrganization: (state: InitialOrganizationStateType, _action: PayloadAction<{ id?: string }>) => {
            return {...state, organization: null, error: null, isLoading: true, isRemoveOrganization: false}
        },
        removeOrganizationSuccess: (state: InitialOrganizationStateType, {payload: success}: PayloadAction<{}>) => {
            return {...state, isLoading: false, error: null, isRemoveOrganization: true, success: success && 'success' in success ? (success as SuccessData).success : false,}
        },
        removeOrganizationError: (state: InitialOrganizationStateType, {payload: error}: PayloadAction<{ error: any }>) => {
            return {...state, organization: null, error, isLoading: false, isRemoveOrganization: false}
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
    getOrganizationMembers,
    getOrganizationMembersSuccess,
    getOrganizationMembersError,
    updateOrganizationState,
    removeOrganization,
    removeOrganizationSuccess,
    removeOrganizationError,
    editOrganization,
    editOrganizationSuccess,
    editOrganizationError
} = organizationSlice.actions
export default organizationSlice.reducer
