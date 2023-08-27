export interface User {
    email?: string,
    firstName?: string,
    lastName?: string,
    created?: string,
    updated?: string,
    token?: string,
    type?: string,
}

export interface Preferences {
    timeZone?: string,
    defaultSendDelay?: number
}

export interface Avatar {
    filename?: string,
    id?: string,
    mimeType?: string,
    url?: string
}

export interface UserDetails {
    id?: string,
    created?: string,
    updated?: string,
    lastSeen?: string,
    status?: string,
    email?: string,
    firstName?: string,
    lastName?: string,
    middleName?: string,
    deviceIds?: string,
    preferences?: Preferences | null,
    avatar?: Avatar | null
}


