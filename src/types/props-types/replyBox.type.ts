export declare type ReplyBoxType = {
    messageContent?: MessageContent
}
export declare type MessageContent = {
    draftInfo?: {
        body: string,
        attachments: string[]
    },
    mailboxes?: string[],

}
