import {MessagePart} from "@/models/messagesPart";
import {MessageAttachments} from "@/models/messageAttachments";

export type MessageRecipient = {
  name: string
  email: string
}

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
    from?: MessageRecipient,
    to?: MessageRecipient[],
    cc?: MessageRecipient[],
    headers?: MessageHeaders[],
    contentRoot?: string,
    draftInfo?: MessageDraftInfo,
    cachedBody?: MessagePart | null,
    cachedAttachments?: MessageAttachments[] | [],
    scope?: string,
}

export interface MessageDraft {
    id?: string,
    from?: MessageRecipient,
    to: MessageRecipient[],
    cc?: MessageRecipient[],
    threadId?: string,
    mailboxes?: string[],
    providerId?: string,
    draftInfo?: MessageDraftInfo,
    contentRoot?: string,
    created?: string,
    subject?: string,
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
    to: MessageRecipient[],
    body?: string,
    draftInfo?: MessageDraftInfo,
    mailboxes?: string[] | undefined,
    scope?: string
}
