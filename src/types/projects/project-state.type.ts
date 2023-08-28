import {Project} from "../../models";

export declare type InitialProjectState = {
    projects: Project[],
    project: Project | null,
    selectedProject: Project | null,
    isLoading: boolean,
    error: Error | any
}
