export interface TeamMember {
    id?: string,
    userId?: string,
    email?: string,
    name?: string,
    signature?: string,
    status?: string,
    providerType?: string,
    syncHistory? : {
        mailInitSynced: Date,
    }
    created?: string,
    updated?: string,
    role?: string,
    itemId?: string
}
