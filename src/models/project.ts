export interface Project {
    id?: string,
    name?: string,
    organizationId?: string,
    accountId?: string,
    created?: string,
    updated?: string,
    numThreads?: number,
    scope?: string,
    projectMeta?: ProjectMetaData

}

export interface ProjectRequestBody {
    projectMeta?: ProjectMetaData
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
