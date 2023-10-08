import {InitialMessageStateType} from "@/types";
import {BaseService} from "@/services/base.service";
import {updateMessageState} from "@/redux/messages/action-reducer";
import {Message, MessageAttachments, MessagePart} from "@/models";

class MessageService extends BaseService {
    constructor() {
        super();
    }

    private getMessageState(): InitialMessageStateType {
        return this.getState('messages');
    }

    pageChange() {
        this.setMessageState({selectedMessage: null, messages: []});
    }

    setSelectedMessage(message: Message | null | undefined) {
        this.setMessageState({selectedMessage: message});
    }

    setMessageBody(body: MessagePart | null) {
        this.setMessageState({messagePart: body});
    }

    setMessageAttachments(attachments: MessageAttachments[]) {
        this.setMessageState({messageAttachments: attachments});
    }

    setMessages(messages: Message[]) {
        this.setMessageState({messages: messages});
    }

    setMessageState(body: InitialMessageStateType) {
        this.dispatchAction(updateMessageState, body);
    }
}

export const messageService = new MessageService();
