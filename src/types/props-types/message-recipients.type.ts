import {MessageRecipient} from "@/models/message";

export declare type RecipientsValue = { items: MessageRecipient[], value: MessageRecipient };
export declare type RecipientsType = { cc: RecipientsValue, bcc: RecipientsValue, recipients: RecipientsValue };

export declare type MessageRecipientsType = {
    emailRecipients: RecipientsType,
    updateValues: (_value: any) => void;
}
