import {Thread} from "@/models";

export declare type InitialThreadStateType = {
    threads?: Thread[],
    isLoading?: boolean
    error?: Error | any
    selectedThread?: Thread | null
    multiSelection?: string[]
    updateSuccess?: boolean
    success?: boolean
    isThreadSearched?: boolean
    tabValue?: string,
    subTabValue?: string,
    isThreadFocused?: boolean
}

export declare type InitialMembershipStateType = {
    membership?: any;
    isLoading?: boolean
    error?: Error | any
    success?: boolean
    isProjectRemoveSuccess?: boolean
    isOrganizationRemoveSuccess?: boolean
    isThreadAddedToProjectSuccess?: boolean
}
