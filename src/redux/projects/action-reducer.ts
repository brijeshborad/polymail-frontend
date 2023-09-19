import {createSlice, current, PayloadAction} from "@reduxjs/toolkit";
import {InitialProjectState} from "@/types";
import {Project, ProjectMetaData, ProjectRequestBodyWithUndo, TeamMember} from "@/models";

const initialState: any = {
    projects: [],
    project: null,
    isLoading: false,
    error: null,
    selectedProject: null,
    members: [],
    invitees: [],
    isProjectUpdateSuccess: false,
    createProjectSuccess: false
} as InitialProjectState

const projectsSlice = createSlice({
    name: 'projects',
    initialState,
    reducers: {
        getAllProjects: (state: InitialProjectState) => {
            return {...state, projects: [], isLoading: true, error: null}
        },
        getAllProjectsSuccess: (state: InitialProjectState, {payload: projects}: PayloadAction<{}>) => {
            return {...state, projects, isLoading: false, error: null}
        },
        getAllProjectsError: (state: InitialProjectState, {payload: error}: PayloadAction<{ error: any }>) => {
            return {...state, projects: [], isLoading: false, error}
        },

        getProjectById: (state: InitialProjectState, _action: PayloadAction<{ id?: string }>) => {
            return {...state, project: {}, isLoading: true, error: null}
        },
        getProjectByIdSuccess: (state: InitialProjectState, {payload: project}: PayloadAction<{}>) => {
            return {...state, project, isLoading: false, error: null}
        },
        getProjectByIdError: (state: InitialProjectState, {payload: error}: PayloadAction<{ error: any }>) => {
            return {...state, project: {}, isLoading: false, error}
        },

        createProjects: (state: InitialProjectState, _action: PayloadAction<{ name?: string, accountId?: string, organizationId?: string, emoji?: string }>) => {
            return {...state, project: null, isLoading: true, error: null, createProjectSuccess: false}
        },
        createProjectsSuccess: (state: InitialProjectState, {payload: project}: PayloadAction<{}>) => {
            let currentProjects = [...(current(state).projects || [])] as Project[];
            return {
                ...state,
                projects: [project, ...currentProjects],
                project,
                isLoading: false,
                error: null,
                createProjectSuccess: true
            }
        },
        createProjectsError: (state: InitialProjectState, {payload: error}: PayloadAction<{ error: any }>) => {
            return {...state, project: null, isLoading: false, error}
        },

        getProjectMembers: (state: InitialProjectState, _action: PayloadAction<{ projectId: string }>) => {
            return {...state, members: [], isLoading: true, error: null, createProjectSuccess: false}
        },
        getProjectMembersSuccess: (state: InitialProjectState, {payload: members}: PayloadAction<{}>) => {
            return {...state, members, isLoading: false, error: null}
        },
        getProjectMembersError: (state: InitialProjectState, {payload: error}: PayloadAction<{ error: any }>) => {
            return {...state, members: [], isLoading: false, error}
        },

        getProjectMembersInvites: (state: InitialProjectState, _action: PayloadAction<{ projectId: string }>) => {
            return {...state, invitees: [], isLoading: true, error: null}
        },
        getProjectMembersInvitesSuccess: (state: InitialProjectState, {payload: invitees}: PayloadAction<{}>) => {
            return {...state, invitees, isLoading: false, error: null}
        },
        getProjectMembersInvitesError: (state: InitialProjectState, {payload: error}: PayloadAction<{ error: any }>) => {
            return {...state, invitees: [], isLoading: false, error}
        },

        // change role from project members
        updateProjectMemberRole: (state: InitialProjectState, _action: PayloadAction<{ projectId?: string, accountId?: string, body?: { role: string } }>) => {
            return {...state, member: null, error: null, isLoading: false, updateSuccess: false, success: false}
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
                success: true
            }
        },
        updateProjectMemberRoleError: (state: InitialProjectState, {payload: error}: PayloadAction<any>) => {
            return {...state, member: null, error, isLoading: false, updateSuccess: false, success: false}
        },

        updateProject: (state: InitialProjectState, _action: PayloadAction<{ id: string, body?: { favorite?: boolean, order?: number } }>) => {
            return {...state, isProjectUpdateSuccess: false, error: null}
        },

        updateOptimisticProject: (state: InitialProjectState, {payload: project}: PayloadAction<{ id: string, body: { do: ProjectMetaData, undo: ProjectMetaData } }>) => {
            let currentProjects = [...(current(state).projects || [])] as Project[];
            let projectData = {...({...project, projectMeta: project.body.do}) || {}} as Project;
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
        updateProjectError: (state: InitialProjectState, {payload: error}: PayloadAction<{ error: any }>) => {
            return {...state, isProjectUpdateSuccess: false, error}
        },
        undoProjectUpdate: (state: InitialProjectState, {payload: error}: PayloadAction<{ error: any, project: { id: string, body: ProjectRequestBodyWithUndo } }>) => {


            let currentProjects = [...(current(state).projects || [])] as Project[];
            let projectData = {...({...error.project, projectMeta: error.project.body.undo}) || {}} as Project;
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
            return {...state, projects: [...sortedList], isProjectUpdateSuccess: false, error}
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
    undoProjectUpdate
} = projectsSlice.actions
export default projectsSlice.reducer
