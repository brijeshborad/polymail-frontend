import {InitialThreadStateType} from "@/types";
import {Message, MessageDraft, Thread} from "@/models";
import {batchUpdateThreads, updateThreadState} from "@/redux/threads/action-reducer";
import {BaseService} from "@/services/base.service";
import {draftService} from "@/services/draft.service";
import {MAILBOX_SNOOZED} from "@/utils/constants";
import {generateToasterId} from "@/utils/common.functions";
import dayjs from "dayjs";

declare type MailBoxTypes = 'INBOX' | 'DRAFT' | 'UNREAD' | 'ARCHIVE' | 'TRASH' | 'SNOOZED' | 'STARRED' | string;

class ThreadsService extends BaseService {
    constructor() {
        super();
    }

    private getThreadState(): InitialThreadStateType {
        return this.getState('threads');
    }

    setSelectedThread(thread: Thread | null) {
        this.setThreadState({selectedThread: thread});
    }

    setTabValue(tabValue: string = '') {
        this.setThreadState({tabValue});
    }

    setTabValueWithEmptyThread(tabValue: string = '') {
        this.setThreadState({tabValue, threads: []});
    }

    cancelThreadSearch() {
        this.setThreadState({isThreadSearched: false, multiSelection: []});
    }

    pushOrUpdateDraftInThreadMessages(tab: string = '', draft: MessageDraft) {
        let currentThread: Thread | null | undefined = this.getThreadState().selectedThread;
        let threads: Thread[] = this.getThreadState().threads || [];
        if (tab === 'DRAFT' && !currentThread) {
            currentThread = threads.find((thread: Thread) => (thread.messages || []).find((message: Message) => message.id === draft.id));
        }

        if (currentThread && currentThread.id && threads.length > 0) {
            let currentThreads = [...threads];
            let currentThreadIndex = currentThreads.findIndex((thread: Thread) => thread.id === currentThread?.id);
            let currentMessages = [...(currentThread.messages || [])];
            let draftIndex = currentMessages.findIndex((message: Message) => message.id === draft.id);
            if (draftIndex !== -1) {
                currentMessages[draftIndex] = draft as Message;
            } else {
                currentMessages.push(draft as Message);
            }
            currentThreads[currentThreadIndex] = {
                ...currentThreads[currentThreadIndex],
                messages: [...currentMessages]
            };
            draftService.setDraftState({success: false, updatedDraft: null});
            this.setThreadState({threads: currentThreads, success: true});
        }
    }

    setThreadState(body: any) {
        this.dispatchAction(updateThreadState, body);
    }

    moveThreadToMailBox(mailBoxType: MailBoxTypes, snoozeDate: string = '') {
        let selectedThreadIds = this.getThreadState().multiSelection || [];
        let threads = this.getThreadState().threads || [];
        if (selectedThreadIds.length > 0) {
            const messagePlural = selectedThreadIds.length === 1 ? 'message' : 'messages'
            let body: any  = {
                threadIds: selectedThreadIds,
                mailboxes: [mailBoxType]
            }
            let toastId = generateToasterId();
            if (mailBoxType === MAILBOX_SNOOZED) {
                const targetDate = dayjs(snoozeDate)
                const currentDate = dayjs();
                body.snooze = targetDate.diff(currentDate, 'second')
            }
            let movingThreads = threads.filter((thread: Thread) => selectedThreadIds.includes(thread.id!));
            let batchUpdateMoveBody = {
                body: {body},
                toaster: {
                    success: {
                        desc: `Your message has been moved to ${mailBoxType.toString().toLowerCase()}`,
                        title: `${selectedThreadIds.length} ${messagePlural} has been ${mailBoxType.toString().toLowerCase()}`,
                        type: 'undo_changes',
                        id: toastId,
                    }
                },
                undoAction: {
                    showUndoButton: true,
                    dispatch: this.getDispatch(),
                    action: batchUpdateThreads,
                    undoBody: {
                        body: {
                            threadIds: selectedThreadIds,
                            mailboxes: movingThreads[0].mailboxes || [],
                        },
                        tag: mailBoxType.toString().toLowerCase(),
                        afterUndoAction: () => {
                            this.setThreadState({threads: threads, selectedThread: threads[0]});
                        }
                    }
                },
                showToasterAfterUndoClick: true
            }
            this.dispatchAction(batchUpdateThreads, batchUpdateMoveBody);
            let newFilteredThreads = threads.filter((thread: Thread) => !selectedThreadIds.includes(thread.id!))
            this.setThreadState({threads: newFilteredThreads, selectedThread: newFilteredThreads[0]});
            this.cancelThreadSearch();
        }
    }
}

export const threadService = new ThreadsService();
