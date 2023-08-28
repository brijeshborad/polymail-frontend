import {createSlice, current, PayloadAction} from "@reduxjs/toolkit";
import {InitialProjectState, InitialOrganizationStateType} from "@/types";
import {Project} from "@/models";

const initialState: any = {
    projects: [],
    project: null,
    isLoading: false,
    error: null,
    selectedProject: null,
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
            // projects = (projects || []).sort((a: Project, b: Project) => (new Date(b.created as string).valueOf() - new Date(a.created as string).valueOf()));
            return {...state, projects, isLoading: false, error: null}
        },
        getAllProjectsError: (state: InitialProjectState, {payload: error}: PayloadAction<{ error: any }>) => {
            return {...state, projects: [], isLoading: false, error}
        },

        getProjectById: (state: InitialProjectState, _action: PayloadAction<{id?: string}>) => {
            return {...state, projects: {}, isLoading: true, error: null}
        },
        getProjectByIdSuccess: (state: InitialProjectState, {payload: project}: PayloadAction<{ }>) => {
            return {...state, project, isLoading: false, error: null}
        },
        getProjectByIdError: (state: InitialProjectState, {payload: error}: PayloadAction<{ error: any }>) => {
            return {...state, projects: {}, isLoading: false, error}
        },

        createProjects: (state: InitialProjectState, _action: PayloadAction<{ name?: string, accountId?: string, organizationId?: string }>) => {
            return {...state, project: null, isLoading: true, error: null}
        },
        createProjectsSuccess: (state: InitialProjectState, {payload: project}: PayloadAction<{ }>) => {
            let currentThreads = [...(current(state).projects || [])] as Project[];
            return {...state, projects: [project, ...currentThreads], project, isLoading: false, error: null}
        },
        createProjectsError: (state: InitialProjectState, {payload: error}: PayloadAction<{ error: any }>) => {
            return {...state, project: null, isLoading: false, error}
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

        updateProjectState: (state: InitialProjectState, action: PayloadAction<InitialProjectState>) => {
            return {...state, ...action.payload}
        },
    }
})

export const {
    getAllProjects,
    getAllProjectsSuccess,
    getAllProjectsError,
    createProjects,
    createProjectsSuccess,
    createProjectsError,
    updateProjectState,
    getProjectMembers,
    getProjectMembersSuccess,
    getProjectMembersError,
    getProjectById,
    getProjectByIdSuccess,
    getProjectByIdError
} = projectsSlice.actions
export default projectsSlice.reducer
