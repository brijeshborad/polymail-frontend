import {Message} from "@/models";

export declare type MessageHeaderTypes = {
    closeCompose?: () => void,
    index: number | null,
    inboxMessages: Message[],
    headerType: string
}
