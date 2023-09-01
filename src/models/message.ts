import {MessagePart} from "@/models/messagesPart";
import {MessageAttachments} from "@/models/messageAttachments";

export interface Message {
    id?: string,
    _id?: string,
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
    cc?: string[],
    headers?: MessageHeaders[],
    contentRoot?: string,
    draftInfo?: MessageDraftInfo,
    cachedBody?: MessagePart | null,
    cachedAttachments?: MessageAttachments[] | [],
    scope?: string,
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
    attachments?: MessageAttachments[],
}

export interface MessageRequestBody {
    subject?: string,
    to: string[],
    body?: string,
    draftInfo?: MessageDraftInfo,
    mailboxes?: string[] | undefined,
    scope?: string
}
