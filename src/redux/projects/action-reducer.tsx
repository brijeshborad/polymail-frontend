import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import {Project} from "../../models";

type InitialProjectState = {
    projects: Project[],
    project: Project,
    isLoading: boolean
}

const initialState = {
    projects: [],
    project: null,
    isLoading: false,
} as InitialProjectState

const projectsSlice = createSlice({
    name: 'projects',
    initialState,
    reducers: {
        getAllProjects: (state: InitialProjectState, action: PayloadAction<null>) => {

        },
        setAllProjects: (state: InitialProjectState, action: PayloadAction<null>) => {

        }
    }
})

export const {getAllProjects, setAllProjects} = projectsSlice.actions
export default projectsSlice.reducer
