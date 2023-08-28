import {Message} from "@/models/message";

export interface Thread {
    id?: string | undefined,
    from?: string,
    firstMessage?: string,
    latestMessage?: string,
    updated?: string,
    user?: string,
    account?: string,
    providerId?: string,
    historyId?: number,
    subject?: string,
    snippet?: string,
    mailboxes?: string[],
    numMessages?: number,
    messages?: Message[],
    project?: string
}

export interface ThreadsRequestBody {
    mailboxes?: string[] | undefined,
    project?: string

}
