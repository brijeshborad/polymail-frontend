export interface Organization {
    id: string,
    name: string,
    status: string,
    preferences: {
        blacklistEmails: Array<string>,
        disableSyncBlacklistEmailsToCRM: boolean,
        disableBlockTrackingPixels: boolean
    }
    created?: string,
    updated?: string,
}
