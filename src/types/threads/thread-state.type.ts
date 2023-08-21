import {Thread} from "@/models";

export declare type InitialThreadStateType = {
    threads?: Thread[],
    thread?: Thread | null,
    isLoading?: boolean
    error?: Error | any
    selectedThread?: Thread | null
    updateSuccess?: boolean
}
