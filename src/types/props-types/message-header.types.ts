import {Message} from "@/models";

export declare type MessageHeaderTypes = {
    closeCompose: () => void,
    index: number | null,
    showPreNextMessage: (_type: string) => void,
    inboxMessages: Message[],
    herderType: string
}
