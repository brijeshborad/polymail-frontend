export interface Account {
    id?: string,
    name?: string,
    email?: string,
    created?: string,
    updated?: string,
    success?: boolean,
    signature?: string
    userId?: string
    status?: string
    syncHistory?: {
        mailInitSynced?: string | null,
        mailSynced?: string | null
    }
}
