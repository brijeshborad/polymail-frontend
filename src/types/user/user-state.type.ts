import {User} from "../../models";
import {Avatar, MagicCode, UserDetails} from "@/models";

export declare type InitialAuthState = {
    user?: User | undefined | null,
    isLoading?: boolean
    error?: Error | any | null,
    googleAuthRedirectionLink?: { url?: string } | null
    passwordChangeSuccess?: boolean
    passwordResetSuccess?: boolean
    magicCodeSuccess?: boolean,
    magicCodeResponse?: MagicCode | null
    refreshToken?: string
}

export declare type InitialUserState = {
    user?: User | undefined,
    isLoading?: boolean
    error?: Error | any | null,
    userDetails?: UserDetails | null | undefined,
    profilePicture?: Avatar | undefined,
    profilePictureUpdated?: boolean | undefined
    userDetailsUpdateSuccess?: boolean | undefined
    profilePictureRemoved?: boolean | undefined
}
