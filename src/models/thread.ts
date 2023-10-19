import {Message, MessageRecipient} from "@/models/message";
import {Project, UserProjectOnlineStatus} from "@/models/project";

export interface Thread {
    id?: string | undefined,
    _id?: string | undefined,
    from?: MessageRecipient,
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
    project?: string,
    projects?: Project[],
    userProjectOnlineStatus?: UserProjectOnlineStatus[],
    showOnlineMembersCount?: number
    snooze?: string
}

export interface ThreadsRequestBody {
    mailboxes?: string[] | undefined,
    project?: string

}
