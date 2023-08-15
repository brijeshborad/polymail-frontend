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
    draftInfo?: MessageDraftInfo,
}

export interface MessageDraft {
    contentRoot?: string,
    created?: string,
    draftInfo?: MessageDraftInfo,
    from?: string,
    mailboxes?: string[],
    id?: string,
    providerId?: string,
    threadId?: string,
}

export interface sendMessage {
    id?: string,
}

export interface MessageHeaders {
    name?: string,
    value?: string
}

export interface MessageAttachment {
    filename: string,
    data?: string
}

export interface MessageDraftInfo {
    body?: string,
    attachments?: MessageAttachment[],
}

export interface MessageRequestBody {
    subject?: string,
    to?: string[],
    body?: string,
    draftInfo?: MessageDraftInfo,
    mailboxes?: string[] | undefined,

}
