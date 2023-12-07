import {InitialMessageStateType} from "@/types";
import {BaseService} from "@/services/base.service";
import {updateMessageState} from "@/redux/messages/action-reducer";
import {Message, MessageAttachments, MessageDraft, MessagePart, Thread} from "@/models";
import {generateToasterId} from "@/utils/common.functions";
import dayjs from "dayjs";
import {sendMessage, updatePartialMessage} from "@/redux/draft/action-reducer";
import {Toaster} from "@/components/common";
import {draftService} from "@/services/draft.service";
import {createStandaloneToast} from "@chakra-ui/react";
import {threadService} from "@/services/threads.service";
import {commonService} from "@/services/common.service";
import {globalEventService} from "@/services/global-event.service";
import {getDraftStatus, setDraftStatus} from "@/utils/cache.functions";
import {cacheService} from "@/services/cache.service";

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

    setSelectedMessageIfMessageIdMatches(message: Message | null | undefined) {
        let {selectedMessage} = this.getMessageState();
        if (selectedMessage?.id === message?.id) {
            this.setMessageState({selectedMessage: message});
        }
    }

    clearMessageBodyAndAttachments() {
        this.setMessageState({messagePart: null, messageAttachments: undefined});
    }

    clearMessageAndAttachments() {
        this.setMessageState({messageAttachments: undefined});
    }

    setMessageBody(body: MessagePart | null) {
        this.setMessageState({messagePart: body});
    }

    setMessageAttachments(attachments: MessageAttachments[], messageId: string) {
        this.setMessageState({messageAttachments: {attachments, messageId}});
    }

    setMessages(messages: Message[]) {
        this.setMessageState({messages: messages});
    }

    setMessageState(body: InitialMessageStateType) {
        this.dispatchAction(updateMessageState, body);
    }

    sendMessage(isCompose: boolean = false, scheduledDate: string = '', draft: any, performForDraftTab: boolean = false) {
        const {toast} = createStandaloneToast()
        let currentDraft: any = {...draft};
        this.setDraftCache(draft.id);
        let params: any = {send: true};
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
            Toaster({
                desc: scheduledDate || '',
                type: 'send_confirmation',
                title: 'Your message has been scheduled',
                id: polyToast,
                undoClick: (type: string) => {
                    if (type === 'undo') {
                        params = {undo: true}
                        if (!isCompose) {
                            threadService.updateThreadForUndoOrSend('undo', currentDraft?.draftInfo?.body);
                            globalEventService.fireEvent({data: {draftId: currentDraft.id}, type: 'draft.updateIndex'});
                        } else {
                            if (performForDraftTab) {
                                let undoDraft = draftService.getUndoDraft();
                                threadService.performThreadsUndoForDraftTab(undoDraft?.threadId || '');
                            } else {
                                commonService.toggleComposing(true);
                                draftService.restoreBackupComposeDraft()
                            }
                            globalEventService.fireEvent('draft.undo');
                        }
                        this.setDraftCache(currentDraft.id, false);
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
                            if (!isCompose) {
                                threadService.updateThreadForUndoOrSend('undo', currentDraft?.draftInfo?.body);
                                globalEventService.fireEvent({
                                    data: {draftId: currentDraft.id},
                                    type: 'draft.updateIndex'
                                });
                            } else {
                                if (performForDraftTab) {
                                    let undoDraft = draftService.getUndoDraft();
                                    threadService.performThreadsUndoForDraftTab(undoDraft?.threadId || '');
                                } else {
                                    commonService.toggleComposing(true);
                                    draftService.restoreBackupComposeDraft()
                                }
                                globalEventService.fireEvent('draft.undo');
                            }
                            this.setDraftCache(currentDraft.id, false);
                        } else if (type === 'send-now') {
                            params = {now: true}
                        }
                        this.dispatchAction(sendMessage, {body: {id: currentDraft.id!, ...params}});
                        toast.close(`${polyToast}`);
                    }
                })
            }
        }
        this.dispatchAction(updatePartialMessage, {body: {id: currentDraft?.id, body: currentDraft, params}});
        if (!isCompose) {
            threadService.updateThreadForUndoOrSend('send', draft?.draftInfo?.body);
        }
    }

    setDraftCache(messageId: string, isSent: boolean = true) {
        let cachedDraft = {...getDraftStatus()};
        cachedDraft[messageId] = isSent;
        setDraftStatus(cachedDraft);
    }

    toggleFailed(draft: MessageDraft, failed: boolean = true) {
        let {messages} = this.getMessageState();
        let finalMessages = [...(messages || [])];
        let findDraft = finalMessages.findIndex((message: any) => message.id === draft.id);
        if (findDraft !== -1) {
            if (failed) {
                finalMessages[findDraft].draftInfo!.error = draft.draftInfo?.error;
            } else {
                finalMessages[findDraft].draftInfo!.error = null;
            }
            this.setMessages([...finalMessages]);
        }
        let cacheThreads = {...cacheService.getThreadCache()}
        Object.keys(cacheThreads).forEach((key: any) => {
            cacheThreads[key] = [...cacheThreads[key]];
            cacheThreads[key].forEach((thread: Thread, index: number) => {
                let messages = [...(thread.messages || [])];
                let findDraft = messages.findIndex((message: any) => message.id === draft.id);
                if (findDraft !== -1) {
                    if (failed) {
                        messages[findDraft].draftInfo!.error = draft.draftInfo?.error;
                    } else {
                        messages[findDraft].draftInfo!.error = null;
                    }
                    cacheThreads[key][index] = {
                        ...cacheThreads[key][index],
                        messages: messages
                    }
                }
            })
        })
        cacheService.setThreadCache(cacheThreads);
    }
}

export const messageService = new MessageService();
