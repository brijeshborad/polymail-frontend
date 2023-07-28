import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import {InitialProjectState} from "@/types";

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
            return {...state, projects: []}
        },
        setAllProjects: (state: InitialProjectState, action: PayloadAction<null>) => {
        }
    }
})

export const {getAllProjects, setAllProjects} = projectsSlice.actions
export default projectsSlice.reducer
