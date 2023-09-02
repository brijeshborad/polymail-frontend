import {InviteMember, Project, TeamMember} from "@/models";

export declare type InitialProjectState = {
    projects: Project[],
    project: Project | null,
    selectedProject: Project | null,
    isLoading: boolean,
    error: Error | any,
    members?: TeamMember[]
    invitees?: InviteMember[]
}
