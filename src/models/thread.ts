export interface Thread {
    id?: string | undefined,
    from?: string,
    created?: string,
    updated?: string,
    user?: string,
    account?: string,
    providerId?: string,
    historyId?: number,
    subject?: string,
    snippet?: string,
    mailboxes?: string[],
    numMessages?: number,
}

export interface ThreadsRequestBody {
    mailboxes?: string[] | undefined,

}
