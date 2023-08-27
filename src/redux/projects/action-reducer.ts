import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import {InitialOrganizationStateType, InitialProjectState} from "@/types";

const initialState: any = {
    projects: [],
    project: null,
    isLoading: false,
    error: null,
    members: []
} as InitialProjectState

const projectsSlice = createSlice({
    name: 'projects',
    initialState,
    reducers: {
        getAllProjects: (state: InitialProjectState) => {
            return {...state, projects: [], isLoading: true, error: null}
        },
        getAllProjectsSuccess: (state: InitialProjectState, {payload: projects}: PayloadAction<{ }>) => {
            return {...state, projects, isLoading: false, error: null}
        },
        getAllProjectsError: (state: InitialProjectState, {payload: error}: PayloadAction<{ error: any }>) => {
            return {...state, projects: [], isLoading: false, error}
        },

        getProjectMembers: (state: InitialOrganizationStateType,  _action: PayloadAction<{ projectId: string }>) => {
            return {...state, members: [], isLoading: true, error: null}
        },
        getProjectMembersSuccess: (state: InitialOrganizationStateType, {payload: members}: PayloadAction<{}>) => {
            return {...state, members, isLoading: false, error: null}
        },
        getProjectMembersError: (state: InitialOrganizationStateType, {payload: error}: PayloadAction<{ error: any }>) => {
            return {...state, members: [], isLoading: false, error}
        },

        createProjects: (state: InitialProjectState, _action: PayloadAction<{ name: string, accountId: string, organizationId: string }>) => {
            return {...state, project: null, isLoading: true, error: null}
        },
        createProjectsSuccess: (state: InitialProjectState, {payload: project}: PayloadAction<{ }>) => {
            return {...state, project, isLoading: false, error: null}
        },
        createProjectsError: (state: InitialProjectState, {payload: error}: PayloadAction<{ error: any }>) => {
            return {...state, project: null, isLoading: false, error}
        }
    }
})

export const {
    getAllProjects,
    getAllProjectsSuccess,
    getAllProjectsError,
    createProjects,
    createProjectsSuccess,
    createProjectsError,
    getProjectMembers,
    getProjectMembersSuccess,
    getProjectMembersError,
} = projectsSlice.actions
export default projectsSlice.reducer
