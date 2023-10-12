import {InitialMessageStateType} from "@/types";
import {BaseService} from "@/services/base.service";
import {updateMessageState} from "@/redux/messages/action-reducer";
import {Message, MessageAttachments, MessagePart} from "@/models";
import {generateToasterId} from "@/utils/common.functions";
import dayjs from "dayjs";
import {sendMessage} from "@/redux/draft/action-reducer";
import {Toaster} from "@/components/common";
import {draftService} from "@/services/draft.service";
import {createStandaloneToast} from "@chakra-ui/react";
import {threadService} from "@/services/threads.service";
import {commonService} from "@/services/common.service";
import {globalEventService} from "@/services/global-event.service";

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
        this.clearMessageBodyAndAttachments();
        this.setMessageState({selectedMessage: message});
    }

    clearMessageBodyAndAttachments() {
        this.setMessageState({messagePart: null, messageAttachments: undefined});
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

    sendMessage(isCompose: boolean = false, scheduledDate: string = '', emailBody: string = '') {
        let {draft, composeDraft} = draftService.getDraftState();
        let {tabValue} = threadService.getThreadState();
        const {toast} = createStandaloneToast()
        let currentDraft: any = {...draft};
        if (isCompose) {
            currentDraft = {...composeDraft};
        }
        let params = {};
        let polyToast = generateToasterId();
        if (scheduledDate) {
            const targetDate = dayjs(scheduledDate)
            // Get the current date and time
            const currentDate = dayjs();

            /**
             * Delay the message by calculating the difference between
             * now and the date of the schedule.
             * Return it in seconds.
             */
            const secondsDifference = targetDate.diff(currentDate, 'second');
            params = {
                delay: secondsDifference
            }

            this.dispatchAction(sendMessage, {body: {id: currentDraft.id, ...params}});

            Toaster({
                desc: `Your message has been scheduled`,
                type: 'send_confirmation',
                title: 'Your message has been scheduled',
                id: polyToast,
                undoClick: (type: string) => {
                    if (type === 'undo') {
                        params = {undo: true}
                        if (!isCompose) {
                            threadService.updateThreadForUndoOrSend('undo', emailBody);
                        } else {
                            commonService.toggleComposing(true);
                            draftService.restoreBackupComposeDraft();
                        }
                        globalEventService.fireEvent('draft.undo');
                    } else if (type === 'send-now') {
                        params = {now: true}
                    }
                    this.dispatchAction(sendMessage, {body: {id: currentDraft.id!, ...params}});
                    toast.close(`${polyToast}`);
                }
            })
        } else {
            if (currentDraft && currentDraft.to && currentDraft.to.length) {
                Toaster({
                    desc: `Your message has been sent to ${currentDraft?.to && currentDraft?.to[0].email}${currentDraft?.to && currentDraft?.to?.length > 1 ? ` and ${currentDraft?.to && currentDraft?.to?.length - 1} other${currentDraft?.to && currentDraft?.to?.length === 2 ? '' : 's'}` : ''}`,
                    type: 'send_confirmation',
                    title: currentDraft?.subject || '',
                    id: polyToast,
                    undoClick: (type: string) => {
                        if (type === 'undo') {
                            params = {undo: true}
                            console.log('CHECKING', isCompose);
                            if (!isCompose) {
                                threadService.updateThreadForUndoOrSend('undo', emailBody);
                            } else {
                                commonService.toggleComposing(true);
                                draftService.restoreBackupComposeDraft();
                            }
                            globalEventService.fireEvent('draft.undo');
                        } else if (type === 'send-now') {
                            params = {now: true}
                        }
                        this.dispatchAction(sendMessage, {body: {id: currentDraft.id!, ...params}});
                        toast.close(`${polyToast}`);
                    }
                })
            }
        }
        this.dispatchAction(sendMessage, {body: {id: currentDraft.id!, ...params}});
        if (!isCompose) {
            threadService.updateThreadForUndoOrSend('send', emailBody);
        }
    }
}

export const messageService = new MessageService();
