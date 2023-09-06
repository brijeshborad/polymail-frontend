import {Message} from "@/models";

export declare type MessageBoxType = {
    onOpen: () => void,
    isOpen?: boolean,
    onClose?: () => void,
    emailPart?: string,
    messageData?: Message,
    replyType?: string
}
