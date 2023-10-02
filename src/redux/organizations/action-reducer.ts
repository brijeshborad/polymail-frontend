import {createSlice, current, PayloadAction} from "@reduxjs/toolkit";
import {InitialOrganizationStateType, ReducerActionType} from "@/types";
import LocalStorageService from "@/utils/localstorage.service";
import {Organization, TeamMember} from "@/models";

const initialState: any = {
    organizations: [],
    organization: null,
    isLoading: false,
    error: null,
    selectedOrganization: LocalStorageService.updateOrg('get') || null,
    members: [],
    isRemoveOrganization: false,
    isOrganizationAddOrRemoveSuccess: false,
    updateMemberRoleSuccess: false
} as InitialOrganizationStateType

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

        getOrganizationMembers: (state: InitialOrganizationStateType, _action: PayloadAction<ReducerActionType>) => {
            return {...state, members: [], isLoading: true}
        },
        getOrganizationMembersSuccess: (state: InitialOrganizationStateType, {payload: members}: PayloadAction<{}>) => {
            return {...state, members, isLoading: false}
        },
        getOrganizationMembersError: (state: InitialOrganizationStateType,  _action: PayloadAction<any>) => {
            return {...state, members: [], isLoading: false}
        },

        addOrganization: (state: InitialOrganizationStateType, _action: PayloadAction<ReducerActionType>) => {
            return {...state, organization: null, isLoading: true, isOrganizationAddOrRemoveSuccess: false}
        },
        addOrganizationSuccess: (state: InitialOrganizationStateType, {payload: organization}: PayloadAction<{}>) => {
            let currentOrganizations = [...(current(state).organizations || [])] as Organization[];
            return {
                ...state,
                organizations: [organization, ...currentOrganizations],
                organization,
                isLoading: false,
                isOrganizationAddOrRemoveSuccess: true
            }
        },
        addOrganizationError: (state: InitialOrganizationStateType,  _action: PayloadAction<any>) => {
            return {...state, organization: null, isLoading: false, isOrganizationAddOrRemoveSuccess: false}
        },

        editOrganization: (state: InitialOrganizationStateType, _action: PayloadAction<ReducerActionType>) => {
            return {...state, isLoading: true, isOrganizationAddOrRemoveSuccess: false}
        },
        editOrganizationSuccess: (state: InitialOrganizationStateType, {payload: organization}: PayloadAction<{}>) => {
            LocalStorageService.updateOrg('store', organization);
            return {
                ...state,
                selectedOrganization: organization,
                isLoading: false,
                isOrganizationAddOrRemoveSuccess: true
            }
        },
        editOrganizationError: (state: InitialOrganizationStateType,  _action: PayloadAction<any>) => {
            return {...state, isLoading: false, isOrganizationAddOrRemoveSuccess: false}
        },

        removeOrganization: (state: InitialOrganizationStateType, _action: PayloadAction<ReducerActionType>) => {
            return {...state, organization: null, isLoading: true, isRemoveOrganization: false}
        },
        removeOrganizationSuccess: (state: InitialOrganizationStateType, _action: PayloadAction<{}>) => {
            return {...state, isLoading: false, isRemoveOrganization: true}
        },
        removeOrganizationError: (state: InitialOrganizationStateType,  _action: PayloadAction<any>) => {
            return {...state, organization: null, isLoading: false, isRemoveOrganization: false}
        },

        // change role from project members
        updateOrganizationMemberRole: (state: InitialOrganizationStateType, _action: PayloadAction<ReducerActionType>) => {
            return {
                ...state,
                member: null,
                isLoading: false,
                updateMemberRoleSuccess: false,
            }
        },
        updateOrganizationMemberRoleSuccess: (state: InitialOrganizationStateType, {payload: member}: PayloadAction<{}>) => {
            let currentMembers = [...(current(state).members || [])] as TeamMember[];
            let memberData = {...(member) || {}} as TeamMember;
            let index1 = currentMembers.findIndex((item: TeamMember) => item.id === memberData?.itemId);
            currentMembers[index1] = {
                ...currentMembers[index1],
                role: memberData.role
            };
            return {
                ...state,
                members: [...currentMembers],
                isLoading: false,
                updateMemberRoleSuccess: true,
            }
        },
        updateOrganizationMemberRoleError: (state: InitialOrganizationStateType, _action: PayloadAction<any>) => {
            return {...state, member: null, isLoading: false, updateMemberRoleSuccess: false}
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
    editOrganizationError,
    updateOrganizationMemberRole,
    updateOrganizationMemberRoleSuccess,
    updateOrganizationMemberRoleError
} = organizationSlice.actions
export default organizationSlice.reducer
