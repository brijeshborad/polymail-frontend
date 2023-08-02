export interface Message {
    id: string,
    created?: string,
    updated?: string,
    accountId?: string,
    threadId?: string,
    providerId?: string,
    mailboxes?: string[],
    subject?: string,
    snippet?: string,
    from?: string,
    to?: string[],
    headers?: MessageHeaders[],
    contentRoot?: string,
}

export interface MessageHeaders {
    name?: string,
    value?: string
}
