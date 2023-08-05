import {Message, MessageDraft} from "@/models";

export declare type InitialMessageStateType = {
    messages: Message[],
    message: Message | null,
    draft: MessageDraft | null,
    sendMessage: MessageDraft | null,
    isLoading: boolean,
    isCompose: boolean,
    error: Error | any
}


