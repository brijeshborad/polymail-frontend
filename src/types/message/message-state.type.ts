import {Message, MessageDraft} from "@/models";

export declare type InitialMessageStateType = {
    messages: Message[],
    message: Message | null,
    selectedMessage: Message | null,
    draft: MessageDraft | null,
    sendMessage: MessageDraft | null,
    isLoading: boolean,
    isCompose: boolean,
    messagePart: any,
    error: Error | any
}


