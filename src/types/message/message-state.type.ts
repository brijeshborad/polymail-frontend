import {Message, MessageDraft, MessagePart} from "@/models";

export declare type InitialMessageStateType = {
    messages: Message[],
    message: Message | null,
    selectedMessage: Message | null,
    draft: MessageDraft | null,
    sendMessage: MessageDraft | null,
    isLoading: boolean,
    isCompose: boolean,
    messagePart: MessagePart | null,
    error: Error | any
}


