import {Project} from "../../models";

export declare type InitialProjectState = {
    projects: Project[],
    project: Project | null,
    isLoading: boolean
}
