import {Project} from "../../models";

export declare type InitialThreadsState = {
    threads: Project[],
    thread: Project | null,
    isLoading: boolean
    error: Error | any
}
