import {Message, MessageAttachments, MessagePart} from "@/models";

export declare type InitialMessageStateType = {
    messages?: Message[],
    message?: Message | null,
    selectedMessage?: Message | null,
    isLoading?: boolean,
    messagePart?: MessagePart | null,
    messageAttachments?: {
        attachments: MessageAttachments[],
        messageId?: string
    } | null,
    error?: Error | any,
    success?: boolean
    attachmentUrl?: MessageAttachments | null
    showMessageBox?: boolean,
    showAttachmentLoader?: boolean
}


