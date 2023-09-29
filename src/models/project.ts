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
    userProjectOnlineStatus?: UserProjectOnlineStatus[]
}

export interface ProjectRequestBody {
    projectMeta?: ProjectMetaData
}

export interface UserProjectOnlineStatus {
    userId?: string;
    isOnline?: boolean;
    lastOnlineStatusCheck?: Date | string
    avatar?: string
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
