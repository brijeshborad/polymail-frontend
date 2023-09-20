import {Message} from "@/models";

export declare type MessageBoxType = {
    emailPart?: string,
    messageData?: Message | null,
    replyType?: string,
    hideAndShowReplayBox?: (_type: string, _messageData: any) => void,
    threadDetails?: any,
    replyTypeName?: string
}
