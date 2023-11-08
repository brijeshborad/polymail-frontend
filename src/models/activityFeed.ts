import {Avatar} from "@/models/user";

export interface ActivityFeed {
    id?: string,
    created?: string,
    updated?: string,
    userId?: string
    projectId?: string
    accountId?: string
    email?: string,
    title?: string,
    subtitle?: string,
    body?: string,
    isRead?: boolean,
    username?: string,
    avatar?: Avatar,
}
