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

export interface MessageDraft {
    accountId: string,
    contentRoot?: string,
    created?: string,
    draftInfo?: object,
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

export interface MessageRequestBody {
    subject?: string,
    to?: string[],
    body? :string,
    attachments:MessageAttachment[],
    mailboxes: string[],

}
