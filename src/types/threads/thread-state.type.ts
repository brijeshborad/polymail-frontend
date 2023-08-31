import {Thread} from "@/models";

export declare type InitialThreadStateType = {
    threads?: Thread[],
    thread?: Thread | null,
    isLoading?: boolean
    error?: Error | any
    selectedThread?: Thread | null
    updateSuccess?: boolean
    success?: boolean
    isThreadSearched?: boolean
}

export declare type InitialMembershipStateType = {
    membership: any;
    isLoading?: boolean
    error?: Error | any
    success?: boolean
}
