import {User} from "../../models";

export declare type InitialAuthState = {
    user?: User | null,
    isLoading?: boolean
    error?: Error | any | null
    googleAuthRedirectionLink?: { url: string } | null
}
