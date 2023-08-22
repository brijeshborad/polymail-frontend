import {Message, MessageAttachments, MessageDraft, MessagePart} from "@/models";

export declare type InitialMessageStateType = {
    messages?: Message[],
    message?: Message | null,
    selectedMessage?: Message | null,
    isLoading?: boolean,
    isCompose?: boolean,
    messagePart?: MessagePart | null,
    messageAttachments?: MessageAttachments[],
    error?: Error | any,
    success?: boolean
    attachmentUrl?: MessageAttachments | null
}


