import {ContentRoot, Message, MessageAttachments, Thread} from "@/models";

export function extractAndMapThreadAndMessagesBody(threads: Thread[], payload: any, currentThreads: Thread[] | undefined) {
    let rawThreads: Thread[] = [...(threads || [])];
    // rawThreads.sort((a: Thread, b: Thread) => (new Date(b.sortDate as string).valueOf() - new Date(a.sortDate as string).valueOf()));
    rawThreads = rawThreads.map((thread: Thread) => {
        let rawThread = {...thread};
        rawThread.messages = [...(thread.messages || [])];
        rawThread.messages = performMessagesUpdate(rawThread.messages);
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
        if (!message.mailboxes?.includes('DRAFT')) {
            let body = extractBodyFromParts(message.contentRoot);
            let rawMessage = {...message};
            let decoded = Buffer.from(body || '', 'base64').toString();
            let addTargetBlank = decoded.replace(/<a/g, '<a target="_blank"');
            const blob = new Blob([addTargetBlank], {type: "text/html"});
            rawMessage.body = window.URL.createObjectURL(blob);
            rawMessage.attachments = extractAttachments(message.contentRoot);
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
