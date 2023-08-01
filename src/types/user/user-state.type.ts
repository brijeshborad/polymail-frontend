import {User} from "../../models";

export declare type InitialAuthState = {
    User: User | null,
    isLoading: boolean
    error: Error | any | null
}
