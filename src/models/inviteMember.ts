export interface InviteMember {
    id?: string,
    groupId?: string,
    groupType?: string,
    itemId?: string,
    role?: string,
    created?: string,
    invite?: {
        fromAccount?: string
        toEmail?: string
        expires?: string
    }
}
