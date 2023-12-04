import {TeamMember} from "@/models/teamMember";
import {InviteMember} from "@/models/inviteMember";

export interface Project {
    id?: string,
    name?: string,
    emoji?: string,
    organizationId?: string,
    accountId?: string,
    created?: string,
    updated?: string,
    numThreads?: number,
    scope?: string,
    projectMeta?: ProjectMetaData
    userProjectOnlineStatus?: UserProjectOnlineStatus[],
    showOnlineMembersCount?: number,
    accounts: TeamMember[],
    invites: InviteMember[],
}

export interface ProjectRequestBody {
    projectMeta?: ProjectMetaData
}

export interface UserProjectOnlineStatus {
    userId?: string;
    isOnline?: boolean;
    lastOnlineStatusCheck?: Date | string
    avatar?: string
    color?: string
    name?: string
    forceWait?: number
}


export interface ProjectRequestBodyWithUndo {
    do: {
        projectMeta: ProjectMetaData
    }
    undo: {
        projectMeta: ProjectMetaData
    }
}

export interface ProjectMetaData {
    userId?: string,
    projectId?: string,
    order?: number,
    favorite?: boolean
}

export type ProjectFilterTypes = 'domain' | 'email'
export type ProjectRulesStatus = 'enabled' | 'disabled'

export interface ProjectRules {
    project?: Project;
    projectId?: string;
    userId?: string;
    accountId?: string;
    filterType?: ProjectFilterTypes;
    value?: string;
    status?: ProjectRulesStatus;
}

export interface GroupedProjectRules {
    [key: string]: {
        item: Project,
        values: ProjectRules[]
    }
}
