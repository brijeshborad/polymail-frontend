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

    sendMessage(isCompose: boolean = false, scheduledDate: string = '') {
        let {draft, composeDraft} = draftService.getDraftState();
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
                            threadService.updateThreadForUndoOrSend('undo');
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
            if (draft && draft.to && draft.to.length) {
                Toaster({
                    desc: `Your message has been sent to ${draft?.to && draft?.to[0].email}${draft?.to && draft?.to?.length > 1 ? ` and ${draft?.to && draft?.to?.length - 1} other${draft?.to && draft?.to?.length === 2 ? '' : 's'}` : ''}`,
                    type: 'send_confirmation',
                    title: draft?.subject || '',
                    id: polyToast,
                    undoClick: (type: string) => {
                        if (type === 'undo') {
                            params = {undo: true}
                            console.log('CHECKING', isCompose);
                            if (!isCompose) {
                                threadService.updateThreadForUndoOrSend('undo');
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
            threadService.updateThreadForUndoOrSend('send');
        }
    }
}

export const messageService = new MessageService();
