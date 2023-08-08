export interface User {
    email?: string,
    firstName?: string,
    lastName?: string,
    createdAt?: string,
    updatedAt?: string,
    token?: string,
}

export interface UserToken {
    token?: string,
}

export interface LoginWithGoogle {
    mode?: string,
    redirectUrl?: string
    accountType?: string
    platform?: string,
    withToken?: boolean
}

