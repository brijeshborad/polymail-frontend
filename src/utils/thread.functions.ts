import {ContentRoot, Message, MessageAttachments, Thread} from "@/models";

export function extractAndMapThreadAndMessagesBody(threads: Thread[]) {
    let rawThreads: Thread[] = [...(threads || [])];
    rawThreads.sort((a: Thread, b: Thread) => (new Date(b.latestMessage as string).valueOf() - new Date(a.latestMessage as string).valueOf()));
    rawThreads = rawThreads.map((thread: Thread) => {
        let rawThread = {...thread};
        rawThread.messages = [...(thread.messages || [])];
        rawThread.messages = rawThread.messages.map((message: Message) => {
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
        return rawThread;
    })
    return rawThreads;
}


function extractBodyFromParts(contentRoot: ContentRoot | undefined): string {
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

function extractAttachments(part: ContentRoot | undefined): MessageAttachments[] {
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
