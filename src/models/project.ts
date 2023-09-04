export interface Project {
    id?: string,
    name?: string,
    organizationId?: string,
    accountId?: string,
    created?: string,
    updated?: string,
    numThreads?: number,
    scope?: string,
    projectMeta?: {
        userId?: string,
        projectId?: string,
        order?: number,
        favorite?: boolean
    }
}

export interface ProjectMetaInfo {
    userId?: string,
    projectId?: string,
    order?: number,
    favorite?: boolean
}
