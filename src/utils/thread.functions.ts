import {ContentRoot, Message, MessageAttachments, Thread} from "@/models";
import {MAILBOX_DRAFT, MAILBOX_SENT} from "@/utils/constants";

export function extractAndMapThreadAndMessagesBody(threads: Thread[], payload: any, currentThreads: Thread[] | undefined, currentTab: string, currentSubTab: string) {
    let rawThreads: Thread[] = [...(threads || [])];
    rawThreads.sort((a: Thread, b: Thread) => (new Date(b.sortDate as string).valueOf() - new Date(a.sortDate as string).valueOf()));
    rawThreads = rawThreads.map((thread: Thread) => {
        let rawThread = {...thread};
        rawThread.messages = [...(thread.messages || [])];
        rawThread.messages = performMessagesUpdate(rawThread.messages);
        let allAttachments: MessageAttachments[] = [];
        rawThread.messages.forEach(((item: Message) => {
            if (item.attachments && item.attachments?.length > 0) {
                item.attachments = [...item.attachments];
                item.attachments = item.attachments.map((attachment: MessageAttachments) => {
                    return {...attachment, messageId: item.id}
                })
                allAttachments = [...allAttachments, ...(item.attachments || [])];
            }
        }))
        rawThread.attachments = [...allAttachments];
        rawThread.tab = currentTab;
        rawThread.subTab = currentSubTab;
        rawThread.latestSentMessage = rawThread.messages.findLast((item: Message) => item.mailboxes?.includes(MAILBOX_SENT));
        return rawThread;
    })
    if (payload.from) {
        let finalThreads = [...(currentThreads || [])];
        finalThreads = finalThreads.map((item: Thread) => {
            let finalItem = {...item};
            let newThread = rawThreads.findIndex((rItem: Thread) => rItem.id === item.id);
            if (newThread !== -1) {
                finalItem = {...rawThreads[newThread]};
                rawThreads.splice(newThread, 1);
            }
            return finalItem;
        })
        if (rawThreads.length > 0) {
            rawThreads.forEach((item: Thread) => {
                finalThreads.unshift(item);
            })
        }
        return [...finalThreads];
    } else if (payload.page > 1) {
        return [...(currentThreads || []), ...rawThreads];
    }
    return rawThreads;
}


export function performMessagesUpdate(messages: Message[]) {
    return messages.map((message: Message) => {
        if (!message.mailboxes?.includes(MAILBOX_DRAFT)) {
            let body = extractBodyFromParts(message.contentRoot);
            let rawMessage = {...message};
            let decoded = Buffer.from(body || '', 'base64').toString();
            let addTargetBlank = decoded.replace(/<a/g, '<a target="_blank" style="text-decoration: underline !important"');
            const blob = new Blob([addTargetBlank], {type: "text/html"});
            rawMessage.body = window.URL.createObjectURL(blob);
            rawMessage.attachments = extractAttachments(message.contentRoot);
            rawMessage.rawBody = {data: body};
            if (!rawMessage.id) {
                if (rawMessage._id) {
                    rawMessage.id = rawMessage._id;
                }
            }
            delete rawMessage.contentRoot;
            return rawMessage;
        }
        return message;
    })
}

export function extractBodyFromParts(contentRoot: ContentRoot | undefined): string {
    if (contentRoot) {
        let parts: any = _extractBodyFromParts(contentRoot);
        if (parts !== null) {
            return parts.body;
        }
        return "";
    } else {
        return '';
    }
}

function _extractBodyFromParts(part: ContentRoot): ContentRoot | null {
    let returnValue: any = null;
    switch (part.mimeType) {
        case "text":
            return part;
        case "multipart":
            let subParts = (part.parts || []);
            for (let i = 0; i < subParts.length; i++) {
                let subpart = subParts[i];
                let _part = _extractBodyFromParts(subpart);
                if (_part !== null) {
                    let _mime = _part.mimeType + '/' + _part.mimeSubtype;
                    if (_mime === 'text/html') {
                        return _part
                    }
                    returnValue = _part;
                }
            }
            break;
        default:
            break;

    }
    return returnValue;
}

export function extractAttachments(part: ContentRoot | undefined): MessageAttachments[] {
    if (part) {
        let attachments: MessageAttachments[] = [];
        if (part.attachment) {
            attachments.push(part.attachment!);
        }
        part.parts?.forEach((item: ContentRoot) => {
            let attach = extractAttachments(item);
            attachments = [...attachments, ...attach];
        })
        return attachments
    } else {
        return [];
    }
}
