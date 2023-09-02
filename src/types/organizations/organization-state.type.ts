import {Organization, TeamMember} from "@/models";

export declare type InitialOrganizationStateType = {
    organizations?: Organization[],
    organization?: Organization | null,
    isLoading?: boolean
    error?: Error | any,
    selectedOrganization?: Organization | null
    members?: TeamMember[],
    isRemoveOrganization?: boolean,
    isOrganizationAddOrRemoveSuccess?: boolean
}
