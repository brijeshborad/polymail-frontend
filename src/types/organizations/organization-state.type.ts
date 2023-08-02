import {Organization} from "@/models";

export declare type InitialOrganizationStateType = {
    organizations: Organization[],
    organization: Organization | null,
    isLoading: boolean
    error: Error | any
}
