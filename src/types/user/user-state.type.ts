import {User} from "../../models";
import {UserDetails} from "@/models";

export declare type InitialAuthState = {
    user?: User | undefined,
    isLoading?: boolean
    error?: Error | any | null,
    googleAuthRedirectionLink?: { url?: string } | null,
    userDetails?: UserDetails | undefined,
}
