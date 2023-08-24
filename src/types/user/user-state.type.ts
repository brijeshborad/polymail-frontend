import {User} from "../../models";
import {Avatar, UserDetails} from "@/models";

export declare type InitialAuthState = {
    user?: User | undefined,
    isLoading?: boolean
    error?: Error | any | null,
    googleAuthRedirectionLink?: { url?: string } | null
}

export declare type InitialUserState = {
    user?: User | undefined,
    isLoading?: boolean
    error?: Error | any | null,
    userDetails?: UserDetails | undefined,
    profilePicture?: Avatar | undefined
}
