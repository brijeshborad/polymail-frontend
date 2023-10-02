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
    isThreadFocused?: boolean
    moveToMailBox?: string | null
    snoozeTime?: string | null
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
