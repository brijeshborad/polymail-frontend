import {MessagePart} from "@/models/messagesPart";
import {MessageAttachments} from "@/models/messageAttachments";
import {Project} from "@/models/project";

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
    bcc?: MessageRecipient[],
    headers?: MessageHeaders[],
    contentRoot?: ContentRoot,
    draftInfo?: MessageDraftInfo,
    body?: MessagePart | null | string,
    attachments?: MessageAttachments[] | [],
    scope?: string,
}

export interface MessageDraft {
    id?: string,
    from?: MessageRecipient,
    to?: MessageRecipient[],
    cc?: MessageRecipient[],
    bcc?: MessageRecipient[],
    threadId?: string,
    mailboxes?: string[],
    providerId?: string,
    draftInfo?: MessageDraftInfo,
    contentRoot?: ContentRoot,
    created?: string,
    updated?: string,
    subject?: string,
    projectId?: string,
    projects?: Project[],
}

export interface MessageHeaders {
    name?: string,
    value?: string
}


export interface MessageDraftInfo {
    body?: string,
    attachments?: MessageAttachments[],
    collabId?: string,
}

export interface ContentRoot {
    body?: string;
    created?: string;
    id?: string;
    message?: string;
    mimeSubtype?: string;
    mimeType?: string;
    providerId?: string;
    partId?: string;
    thread?: string;
    parts?: ContentRoot[];
    attachment?: MessageAttachments
    headers?: {name?: string, value?: string}[]
}
