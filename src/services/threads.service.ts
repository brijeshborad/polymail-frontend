import {InitialThreadStateType} from "@/types";
import {Message, MessageDraft, Project, Thread} from "@/models";
import {batchUpdateThreads, updateThreads, updateThreadState} from "@/redux/threads/action-reducer";
import {BaseService} from "@/services/base.service";
import {draftService} from "@/services/draft.service";
import {MAILBOX_DRAFT, MAILBOX_SENT, MAILBOX_SNOOZED} from "@/utils/constants";
import {generateToasterId} from "@/utils/common.functions";
import dayjs from "dayjs";
import {addItemToGroup} from "@/redux/memberships/action-reducer";
import {removeThreadFromProject} from "@/redux/projects/action-reducer";
import {commonService} from "@/services/common.service";
import {globalEventService} from "@/services/global-event.service";
import {getCacheMessages, setCacheMessages} from "@/utils/cache.functions";

declare type MailBoxTypes = 'INBOX' | 'DRAFT' | 'UNREAD' | 'ARCHIVE' | 'TRASH' | 'SNOOZED' | 'STARRED' | string;

class ThreadsService extends BaseService {
    constructor() {
        super();
    }

    public getThreadState(): InitialThreadStateType {
        return this.getState('threads');
    }

    setSelectedThread(thread: Thread | null) {
        this.setThreadState({selectedThread: thread});
    }

    setThreads(threads: Thread[]) {
        this.setThreadState({threads: threads});
    }

    setTabValue(tabValue: string = '') {
        this.setThreadState({tabValue});
    }

    setTabValueWithEmptyThread(tabValue: string = '') {
        this.setThreadState({tabValue, threads: []});
    }

    cancelThreadSearch(isFromHeader: boolean = false) {
        this.setThreadState({
            isThreadSearched: false, multiSelection: [],
            ...(isFromHeader ? {
                threads: [],
                isLoading: true,
                selectedThread: null,
            } : {})
        });
    }

    searchThread() {
        this.setThreadState({
            isThreadSearched: true,
            multiSelection: [],
            threads: [],
            isLoading: true,
            selectedThread: null,
        });
    }

    pageChange() {
        this.setThreadState({
            threads: [],
            success: false,
            updateSuccess: false,
            selectedThread: null,
            tabValue: ''
        });
    }

    setMultiSelectionThreads(ids: string[]) {
        this.setThreadState({multiSelection: ids});
    }

    toggleThreadFocused(enable: boolean) {
        this.setThreadState({isThreadFocused: enable});
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

    setThreadState(body: InitialThreadStateType) {
        this.dispatchAction(updateThreadState, body);
    }

    moveThreadToMailBox(mailBoxType: MailBoxTypes, snoozeDate: string = '') {
        let selectedThreadIds = this.getThreadState().multiSelection || [];
        let threads = this.getThreadState().threads || [];
        if (selectedThreadIds.length > 0) {
            const messagePlural = selectedThreadIds.length === 1 ? 'message' : 'messages'
            let body: any = {
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

    addThreadToProject(item: Project, ref: any = null, allowComposeDraft: boolean = false) {
        let {multiSelection, selectedThread: currentSelectedThread, threads} = this.getThreadState();
        let {composeDraft} = draftService.getDraftState();
        let selectedThread: any = currentSelectedThread;
        if (allowComposeDraft) {
            selectedThread = composeDraft;
        }
        const isThreadMultiSelection = (multiSelection !== undefined && multiSelection.length > 0);
        let threadsId = isThreadMultiSelection ? multiSelection : [selectedThread!.id];
        if (allowComposeDraft) {
            threadsId = [selectedThread.threadId]
        }
        if (selectedThread && selectedThread.id || isThreadMultiSelection) {
            let reqBody = {
                threadIds: threadsId,
                roles: ['n/a'],
                groupType: 'project',
                groupId: item.id
            }
            let polyToast = generateToasterId();
            let toasterSuccessMessage: any = {
                type: 'undo_changes',
                id: polyToast,
                desc: '',
            };
            if (isThreadMultiSelection) {
                toasterSuccessMessage.title = `${(multiSelection || []).length} threads added to ${item.name?.toLowerCase()}`;
            } else {
                toasterSuccessMessage.desc = 'Thread was added to ' + item.name?.toLowerCase() + '.';
                toasterSuccessMessage.title = selectedThread?.subject || 'Success';
            }
            const projects = selectedThread?.projects || [];
            let addProject = {
                ...selectedThread,
                projects: [...projects, item]
            }
            if (allowComposeDraft) {
                draftService.setComposeDraft(addProject)
            } else {
                let index1 = (threads || []).findIndex((thread: Thread) => thread.id === selectedThread?.id);
                let newThreads: Thread[] = threads ?? [];
                if (threads) {
                    newThreads = [...threads];
                    newThreads[index1] = {
                        ...newThreads[index1],
                        projects: [...projects, item]
                    }
                }
                this.setThreadState({threads: newThreads});
            }
            this.dispatchAction(
                addItemToGroup,
                {
                    body: reqBody,
                    toaster: {
                        success: toasterSuccessMessage,
                    },
                    undoAction: {
                        showUndoButton: true,
                        dispatch: this.getDispatch(),
                        action: removeThreadFromProject,
                        undoBody: {
                            body: {
                                threadId: allowComposeDraft ? selectedThread.threadId : selectedThread!.id,
                                projectId: item.id,
                            },
                            success: {
                                desc: 'Thread was removed from ' + item.name?.toLowerCase() + '.',
                                title: selectedThread?.subject || 'Success',
                                type: 'success'
                            },
                            afterUndoAction: () => {
                                if (allowComposeDraft) {
                                    let {composeDraft} = draftService.getDraftState();
                                    let data = (composeDraft?.projects || []).filter((project: Project) => project.id !== item.id);
                                    let thread = {
                                        ...composeDraft,
                                        projects: data
                                    }
                                    draftService.setComposeDraft(thread)
                                }
                                this.setThreadState({selectedThread: selectedThread, threads: threads});
                                globalEventService.fireEvent({data: item, type: 'addToProject.remove'});
                            }
                        },
                        showToasterAfterUndoClick: true
                    }
                }
            )
            if (ref && ref.current) {
                ref.current?.click();
            }
        }
    }

    removeThreadFromProject(item: Project, isOnProjectRoute: boolean = false) {
        let {selectedThread: thread, threads} = this.getThreadState();
        let {isComposing} = commonService.getCommonState();
        let {composeDraft} = draftService.getDraftState();
        let selectedThread: any = thread;
        if (isComposing) {
            selectedThread = {...thread, id: composeDraft?.threadId}
        }
        if (selectedThread && selectedThread.id) {
            let polyToast = generateToasterId();
            let reqBody = {
                threadIds: [selectedThread!.id],
                roles: ['n/a'],
                groupType: 'project',
                groupId: item.id
            }
            this.dispatchAction(removeThreadFromProject, {
                body: {
                    threadId: selectedThread.id,
                    projectId: item.id,
                },
                toaster: {
                    success: {
                        desc: "Project is removed from thread",
                        title: "Success",
                        type: 'undo_changes',
                        id: polyToast,
                    },
                },
                undoAction: {
                    showUndoButton: true,
                    dispatch: this.getDispatch(),
                    action: addItemToGroup,
                    undoBody: {
                        body: reqBody,
                        success: {
                            desc: 'Thread was added to ' + item.name?.toLowerCase() + '.',
                            title: selectedThread?.subject || 'Success',
                            type: 'success'
                        },
                        afterUndoAction: () => {
                            if (isComposing) {
                                const projects = selectedThread?.projects || [];
                                let addProject = {
                                    ...selectedThread,
                                    projects: [...projects, item]
                                }
                                draftService.setComposeDraft(addProject)
                            }
                            this.setThreadState({selectedThread: selectedThread, threads: threads});
                            globalEventService.fireEvent({data: item, type: 'addToProject.add'});
                        }
                    },
                    showToasterAfterUndoClick: true
                }
            })

            if (!isComposing) {
                if (isOnProjectRoute && threads) {
                    let threadIndex = threads.findIndex((thread: Thread) => thread.id === selectedThread?.id);
                    let data = threads.filter((thread: Thread) => thread.id !== selectedThread?.id);
                    this.setThreadState({
                        selectedThread: threads[(threadIndex + 1 < threads.length) ? threadIndex + 1 : (threadIndex >= 0 ? threadIndex - 1 : threadIndex + 1)] || null,
                        threads: data
                    });
                } else {
                    let index1 = (threads || []).findIndex((thread: Thread) => thread.id === selectedThread?.id);
                    let newThreads: Thread[] = threads ?? [];
                    if (threads) {
                        let data = (newThreads[index1]?.projects || []).filter((project: Project) => project.id !== item.id);
                        newThreads = [...threads];
                        newThreads[index1] = {
                            ...newThreads[index1],
                            projects: data
                        }
                        this.setThreadState({threads: newThreads});
                    }
                }
            } else {
                let {composeDraft} = draftService.getDraftState();
                let data = (composeDraft?.projects || []).filter((project: Project) => project.id !== item.id);
                let thread = {
                    ...composeDraft,
                    projects: data
                }
                draftService.setComposeDraft(thread);
                let index1 = (threads || []).findIndex((thread: Thread) => thread.id === selectedThread?.id);
                let newThreads: Thread[] = threads ?? [];
                if (threads) {
                    let data = (newThreads[index1]?.projects || []).filter((project: Project) => project.id !== item.id);
                    newThreads = [...threads];
                    newThreads[index1] = {
                        ...newThreads[index1],
                        projects: data
                    }
                    this.setThreadState({threads: newThreads});
                }
            }
        }
    }

    makeThreadAsRead(thread: Thread | null) {
        if (!thread) return;
        const mailboxes = (thread.mailboxes || [])
        const isUnread = mailboxes.includes('UNREAD');

        if (isUnread) {
            this.dispatchAction(updateThreads, {
                body: {
                    id: thread.id,
                    body: {mailboxes: mailboxes.filter(i => i !== 'UNREAD')}
                }
            });
        }
    }

    makeThreadScope(message: Message | null, type: string) {
        if (!message) return;
        let messageData = {...(message) || {}} as Message;
        let {threads, selectedThread} = this.getThreadState()
        let currentThreads = [...(threads || [])];
        let threadIndex = currentThreads.findIndex((item: Thread) => item.id === selectedThread?.id);
        if (threadIndex !== -1) {
            currentThreads[threadIndex] = {...currentThreads[threadIndex]};
            let currentMessages = [...(currentThreads[threadIndex].messages || [])] as Message[];
            let index1 = currentMessages.findIndex((item: Message) => item.id === messageData?.id);
            if (index1 !== -1) {
                currentMessages[index1] = {
                    ...currentMessages[index1],
                    scope: type
                };
                currentThreads[threadIndex].messages = [...currentMessages];
                this.setThreads(currentThreads);
            }
        }
    }

    updateThreadForUndoOrSend(type: string = 'send') {
        let {draft} = draftService.getDraftState();
        let {threads, selectedThread} = this.getThreadState();
        let convertMessages: Message = {
            ...draft,
            mailboxes: type === 'undo' ? [MAILBOX_DRAFT] : [MAILBOX_SENT],
            snippet: draft?.draftInfo?.body
        }
        let mailBoxes = [...(selectedThread?.mailboxes || [])];
        let mailBoxesIndex = mailBoxes.indexOf(MAILBOX_SENT);
        if (type === 'send') {
            if (mailBoxesIndex === -1) {
                mailBoxes.push(MAILBOX_SENT);
            }
        } else {
            if (mailBoxesIndex > -1) {
                mailBoxes.splice(mailBoxesIndex, 1);
            }
        }
        let currentThreads = [...(threads || [])];
        let threadIndex = currentThreads.findIndex((item: Thread) => item.id === selectedThread?.id);
        let currentMessages = [...(currentThreads[threadIndex].messages || [])];
        let messageIndex = currentMessages.findIndex((item: Message) => item.id === convertMessages.id);
        currentMessages.splice(messageIndex, 1);
        currentMessages.push(convertMessages);
        currentThreads[threadIndex] = {...currentThreads[threadIndex]};
        currentThreads[threadIndex].messages = [...(currentThreads[threadIndex].messages || [])];
        currentThreads[threadIndex].messages = [...currentMessages];
        currentThreads[threadIndex].mailboxes = [...mailBoxes];

        let currentSelectedThread: Thread = {...selectedThread};
        let currentSelectedThreadMessages = [...(selectedThread?.messages || [])];
        messageIndex = currentSelectedThreadMessages.findIndex((item: Message) => item.id === convertMessages.id);
        currentSelectedThreadMessages.splice(messageIndex, 1);
        currentSelectedThreadMessages.push(convertMessages);
        currentSelectedThread.messages = [...currentSelectedThreadMessages];
        currentSelectedThread.mailboxes = [...mailBoxes]
        this.setThreads(currentThreads);
        this.setSelectedThread(currentSelectedThread);

        globalEventService.fireEvent('threads.refresh');
        if (draft) {
            let cacheMessages = getCacheMessages();
            setCacheMessages({
                ...cacheMessages,
                [draft.id as string]: {
                    ...cacheMessages[draft.id as string],
                    data: Buffer.from(draft?.draftInfo!.body || '').toString('base64'),
                    attachments: draft?.draftInfo?.attachments || []
                }
            })
        }

        if (type === 'send') {
            draftService.backupDraftForUndo();
        } else {
            draftService.restoreBackupDraft();
        }
    }
}

export const threadService = new ThreadsService();
