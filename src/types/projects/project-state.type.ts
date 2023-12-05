import {InviteMember, Project, ProjectRules, TeamMember} from "@/models";

export declare type InitialProjectState = {
    projects?: Project[],
    project?: Project | null,
    selectedProject?: Project | null,
    isLoading?: boolean,
    error?: Error | any,
    members?: TeamMember[]
    member?: TeamMember | null
    invitees?: InviteMember[],
    invitee?: InviteMember | null,
    isProjectUpdateSuccess?: boolean
    projectSearchedString?: string
    editProjectSuccess?: boolean
    projectRule?: ProjectRules | null,
}
