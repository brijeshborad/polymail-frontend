export interface Organization {
    id: string,
    name: string,
    status: string,
    preferences: {
        blacklistEmails: Array<string>,
        disableSyncBlacklistEmailsToCRM: boolean,
        disableBlockTrackingPixels: boolean,
        approvedDomains: Array<string>
    }
    created?: string,
    updated?: string,
}
