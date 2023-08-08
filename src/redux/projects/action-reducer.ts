import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import {InitialProjectState} from "@/types";
// import {Project} from "@/models";

const initialState: any = {
    projects: [],
    project: null,
    isLoading: false,
    error: null,
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
        }
    }
})

export const {getAllProjects, getAllProjectsSuccess, getAllProjectsError} = projectsSlice.actions
export default projectsSlice.reducer
