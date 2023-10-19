import {Project, TeamMember} from "@/models";
import { InitialProjectState, ReducerActionType } from "@/types";
import { createSlice, current, PayloadAction } from "@reduxjs/toolkit";

const initialState: any = {
    projects: [],
    project: null,
    isLoading: false,
    error: null,
    selectedProject: null,
    members: [],
    invitees: [],
    isProjectUpdateSuccess: false,
    projectSearchedString: '',
    editProjectSuccess: false,
} as InitialProjectState

const projectsSlice = createSlice({
    name: 'projects',
    initialState,
    reducers: {
        getAllProjects: (state: InitialProjectState, action: PayloadAction<any>) => {
            let finalState = {...state, error: null}
            if (!action.payload.hasOwnProperty('noBlank')) {
                finalState = {...finalState, projects: [], isLoading: true};
            }
            return finalState
        },
        getAllProjectsSuccess: (state: InitialProjectState, {payload: projects}: PayloadAction<{}>) => {
            return {...state, projects, isLoading: false}
        },
        getAllProjectsError: (state: InitialProjectState, {payload: error}: PayloadAction<{ error: any }>) => {
            return {...state, projects: [], isLoading: false, error}
        },

        getProjectById: (state: InitialProjectState, _action: PayloadAction<ReducerActionType>) => {
            return {...state, project: {}, isLoading: true}
        },
        getProjectByIdSuccess: (state: InitialProjectState, {payload: project}: PayloadAction<{}>) => {
            return {...state, project, isLoading: false}
        },
        getProjectByIdError: (state: InitialProjectState,  _action: PayloadAction<any>) => {
            return {...state, project: {}, isLoading: false}
        },

        createProjects: (state: InitialProjectState, _action: PayloadAction<ReducerActionType>) => {
            return {...state, project: null, isLoading: true}
        },
        createProjectsSuccess: (state: InitialProjectState, {payload: project}: PayloadAction<any>) => {
            let currentProjects = [...(current(state).projects || [])] as Project[];
            let projectData = {
                ...project,
                projectMeta: {
                    userId: currentProjects[0]?.projectMeta?.userId,
                    favorite: false,
                    projectId: project.id
                }
            }

            return {
                ...state,
                projects: [projectData, ...currentProjects],
                isLoading: false
            }
        },
        createProjectsError: (state: InitialProjectState, _action: PayloadAction<any>) => {
            return {...state, project: null, isLoading: false}
        },

        getProjectMembers: (state: InitialProjectState, _action: PayloadAction<ReducerActionType>) => {
            return {...state, members: [], isLoading: true}
        },
        getProjectMembersSuccess: (state: InitialProjectState, {payload: members}: PayloadAction<{}>) => {
            return {...state, members, isLoading: false}
        },
        getProjectMembersError: (state: InitialProjectState,  _action: PayloadAction<any>) => {
            return {...state, members: [], isLoading: false}
        },

        getProjectMembersInvites: (state: InitialProjectState, _action: PayloadAction<ReducerActionType>) => {
            return {...state, invitees: [], isLoading: true}
        },
        getProjectMembersInvitesSuccess: (state: InitialProjectState, {payload: invitees}: PayloadAction<{}>) => {
            return {...state, invitees, isLoading: false}
        },
        getProjectMembersInvitesError: (state: InitialProjectState,  _action: PayloadAction<any>) => {
            return {...state, invitees: [], isLoading: false}
        },

        // change role from project members
        updateProjectMemberRole: (state: InitialProjectState, _action: PayloadAction<ReducerActionType>) => {
            return {...state, member: null, isLoading: false}
        },
        updateProjectMemberRoleSuccess: (state: InitialProjectState, {payload: member}: PayloadAction<{}>) => {
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
                error: null,
                isLoading: false,
                updateSuccess: true,
            }
        },
        updateProjectMemberRoleError: (state: InitialProjectState, _action: PayloadAction<any> ) => {
            return {...state, member: null, updateSuccess: false, isLoading: false}
        },

        updateProject: (state: InitialProjectState, _action: PayloadAction<ReducerActionType>) => {
            return {...state, isProjectUpdateSuccess: false}
        },

        updateOptimisticProject: (state: InitialProjectState, {payload}: PayloadAction<ReducerActionType>) => {
            let currentProjects = [...(current(state).projects || [])] as Project[];
            let projectData = {...({...payload.body, projectMeta: payload.body.do}) || {}} as Project;
            let targetIndex = currentProjects.findIndex((item: Project) => item.id === projectData?.id);


            currentProjects[targetIndex] = {
                ...currentProjects[targetIndex],
                projectMeta: {
                    ...currentProjects[targetIndex].projectMeta,
                    order: projectData.projectMeta?.order,
                    favorite: projectData.projectMeta?.favorite,
                }
            };

            const sortedList = [...currentProjects].sort((a: Project, b: Project) => (a.projectMeta?.order || 0) - (b.projectMeta?.order || 0));
            return {...state, projects: [...sortedList], isProjectUpdateSuccess: false, error: null}
        },

        updateProjectSuccess: (state: InitialProjectState, {payload: project}: PayloadAction<{}>) => {
            let currentProjects = [...(current(state).projects || [])] as Project[];
            let projectData = {...(project) || {}} as Project;
            let index1 = currentProjects.findIndex((item: Project) => item.id === projectData?.id);
            currentProjects[index1] = {
                ...currentProjects[index1],
                projectMeta: {
                    ...currentProjects[index1].projectMeta,
                    order: projectData.projectMeta?.order,
                    favorite: projectData.projectMeta?.favorite,
                }
            };
            const sortedList = [...currentProjects].sort((a: Project, b: Project) => (a.projectMeta?.order || 0) - (b.projectMeta?.order || 0));
            return {...state, projects: [...sortedList], isProjectUpdateSuccess: true, error: null}
        },
        updateProjectError: (state: InitialProjectState, _action: PayloadAction<any>) => {
            return {...state, isProjectUpdateSuccess: false}
        },
        undoProjectUpdate: (state: InitialProjectState, {payload}: PayloadAction<ReducerActionType>) => {

            let currentProjects = [...(current(state).projects || [])] as Project[];
            let projectData = {...({...payload.body.project, projectMeta: payload.body.project.body.undo}) || {}} as Project;
            let index1 = currentProjects.findIndex((item: Project) => item.id === projectData?.id);
            currentProjects[index1] = {
                ...currentProjects[index1],
                projectMeta: {
                    ...currentProjects[index1].projectMeta,
                    order: projectData.projectMeta?.order,
                    favorite: projectData.projectMeta?.favorite,
                }
            };

            const sortedList = [...currentProjects].sort((a: Project, b: Project) => (a.projectMeta?.order || 0) - (b.projectMeta?.order || 0));
            return {...state, projects: [...sortedList], isProjectUpdateSuccess: false}
        },

        removeThreadFromProject: (state: InitialProjectState, _action: PayloadAction<ReducerActionType>) => {
            return {...state, isLoading: false}
        },
        removeThreadFromProjectSuccess: (state: InitialProjectState, _action: PayloadAction<{}>) => {
            return {...state,isLoading: false,}
        },
        removeThreadFromProjectError: (state: InitialProjectState, _action: PayloadAction<any>) => {
            return {...state, isLoading: false}
        },

        editProjects: (state: InitialProjectState, _action: PayloadAction<ReducerActionType>) => {
            return {...state, project: null, isLoading: true, editProjectSuccess: false}
        },
        editProjectsSuccess: (state: InitialProjectState, {payload: project}: PayloadAction<{}>) => {
            let currentProjects = [...(current(state).projects || [])] as Project[];
            let projectData = {...(project) || {}} as Project;
            let index1 = currentProjects.findIndex((item: any) => item.id === projectData?.id);
            currentProjects[index1] = {
                ...currentProjects[index1],
                name: projectData.name,
                emoji: projectData.emoji,
            };
            return {
                ...state,
                project,
                projects: [...currentProjects],
                isLoading: false,
                editProjectSuccess:true
            }
        },
        editProjectsError: (state: InitialProjectState, _action: PayloadAction<any>) => {
            return {...state, project: null, isLoading: false, editProjectSuccess: false}
        },

        removeProject: (state: InitialProjectState, _action: PayloadAction<ReducerActionType>) => {
            return {...state, isLoading: false}
        },
        removeProjectSuccess: (state: InitialProjectState, _action: PayloadAction<{}>) => {
            return {...state,isLoading: false,}
        },
        removeProjectError: (state: InitialProjectState, _action: PayloadAction<any>) => {
            return {...state, isLoading: false}
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
    getProjectByIdError,
    getProjectMembersInvites,
    getProjectMembersInvitesSuccess,
    getProjectMembersInvitesError,
    updateProjectMemberRole,
    updateProjectMemberRoleSuccess,
    updateProjectMemberRoleError,
    updateProject,
    updateOptimisticProject,
    updateProjectSuccess,
    updateProjectError,
    removeThreadFromProject,
    removeThreadFromProjectSuccess,
    removeThreadFromProjectError,
    editProjects,
    editProjectsSuccess,
    editProjectsError,
    removeProject,
    removeProjectSuccess,
    removeProjectError,
    undoProjectUpdate
} = projectsSlice.actions
export default projectsSlice.reducer
