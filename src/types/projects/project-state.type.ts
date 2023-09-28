import {InviteMember, Project, TeamMember} from "@/models";

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
    createProjectSuccess?: boolean
    projectSearchedString?: string
}
