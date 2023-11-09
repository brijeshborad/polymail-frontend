import {Message, MessageRecipient} from "@/models/message";
import {Project, UserProjectOnlineStatus} from "@/models/project";
import {MessageAttachments} from "@/models/messageAttachments";

export interface Thread {
    id?: string | undefined,
    _id?: string | undefined,
    from?: MessageRecipient,
    firstMessage?: string,
    latestMessage?: string,
    sortDate?: string,
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
    attachments?: MessageAttachments[]
    mute?: boolean
    latestSentMessage?: Message
    tab?: string
}

export interface ThreadsRequestBody {
    mailboxes?: string[] | undefined,
    project?: string

}
