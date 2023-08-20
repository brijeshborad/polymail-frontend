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
    from: string,
    to: string[],
    cc?: string[],
    headers?: MessageHeaders[],
    contentRoot?: string,
    draftInfo?: MessageDraftInfo,
}

export interface MessageDraft {
    id?: string,
    from?: string,
    to: string[],
    cc?: string[],
    threadId?: string,
    mailboxes?: string[],
    providerId?: string,
    draftInfo?: MessageDraftInfo,
    contentRoot?: string,
    created?: string,
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
    to: string[],
    body?: string,
    draftInfo?: MessageDraftInfo,
    mailboxes?: string[] | undefined,

}
