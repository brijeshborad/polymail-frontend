import {InitialThreadStateType} from "@/types";
import {Message, MessageDraft, Project, Thread} from "@/models";
import {batchUpdateThreads, updateThreads, updateThreadState} from "@/redux/threads/action-reducer";
import {BaseService} from "@/services/base.service";
import {draftService} from "@/services/draft.service";
import {
    MAILBOX_ARCHIVE,
    MAILBOX_DRAFT, MAILBOX_INBOX,
    MAILBOX_SENT,
    MAILBOX_SNOOZED, MAILBOX_SPAM, MAILBOX_STARRED, MAILBOX_TRASH,
    MAILBOX_UNREAD
} from "@/utils/constants";
import {generateToasterId} from "@/utils/common.functions";
import dayjs from "dayjs";
import {addItemToGroup} from "@/redux/memberships/action-reducer";
import {removeThreadFromProject} from "@/redux/projects/action-reducer";
import {commonService} from "@/services/common.service";
import {globalEventService} from "@/services/global-event.service";
import {getDraftStatus} from "@/utils/cache.functions";
import {messageService} from "@/services/message.service";
import {getPlainTextFromHtml} from "@/utils/editor-common-functions";
import {performMessagesUpdate} from "@/utils/thread.functions";
import {cacheService} from "@/services/cache.service";
import {projectService} from "@/services/project.service";

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

    setSubTabValue(subTabValue: string = '') {
        this.setThreadState({subTabValue});
    }

    setTabValueWithEmptyThread(tabValue: string = '') {
        this.setThreadState({tabValue, threads: []});
    }

    cancelThreadSearch(isFromHeader: boolean = false) {
        let {isThreadSearched, multiSelection} = this.getThreadState();
        if (isThreadSearched || (multiSelection || []).length > 0) {
            this.setThreadState({
                isThreadSearched: false, multiSelection: [],
                ...(isFromHeader ? {
                    threads: [],
                    isLoading: true,
                    selectedThread: null,
                } : {})
            });
            messageService.setMessages([]);
        }
    }

    searchThread(checkForValidation: boolean = false) {
        if (checkForValidation) {
            let {isThreadSearched} = this.getThreadState();
            if (!isThreadSearched) {
                this.setThreadState({
                    isThreadSearched: true,
                    multiSelection: [],
                    threads: [],
                    isLoading: false,
                    selectedThread: null,
                });
                messageService.setMessages([]);
            }
        } else {
            this.setThreadState({
                isThreadSearched: true,
                multiSelection: [],
                threads: [],
                isLoading: true,
                selectedThread: null,
            });
            messageService.setMessages([]);
        }
    }

    pageChange(blankTabValue: boolean = true) {
        this.setThreadState({
            threads: [],
            success: false,
            updateSuccess: false,
            selectedThread: null,
            ...(blankTabValue ? {tabValue: ''} : {})
        });
    }

    setMultiSelectionThreads(ids: string[]) {
        this.setThreadState({multiSelection: ids});
    }

    toggleThreadFocused(enable: boolean) {
        this.setThreadState({isThreadFocused: enable});
    }

    pushOrUpdateDraftInThreadMessages(draft: MessageDraft) {
        let threads: Thread[] = this.getThreadState().threads || [];
        let currentThread = threads.find((thread: Thread) => thread.id === draft.threadId);
        if (currentThread && currentThread.id && threads.length > 0) {
            let currentThreads = [...threads];
            let currentThreadIndex = currentThreads.findIndex((thread: Thread) => thread.id === currentThread?.id);
            let currentMessages = [...(currentThread.messages || [])];
            let draftIndex = currentMessages.findIndex((message: Message) => message.id === draft.id);
            if (draftIndex !== -1) {
                currentMessages[draftIndex] = {...draft as Message};
            } else {
                currentMessages.push(draft as Message);
            }
            currentThreads[currentThreadIndex] = {
                ...currentThreads[currentThreadIndex],
                messages: [...currentMessages]
            };
            if (currentThread.id === draft.threadId) {
                if (!getDraftStatus()[draft.id!]) {
                    draftService.setReplyDraft(draft);
                }
            }
            this.setThreadState({threads: currentThreads, success: true});
            // let selectedThread = {...currentThread};
            // let selectedThreadMessages = [...(selectedThread.messages || [])];
            // draftIndex = selectedThreadMessages.findIndex((message: Message) => message.id === draft.id);
            // if (draftIndex !== -1) {
            //     selectedThreadMessages[draftIndex] = {...draft as Message};
            // } else {
            //     selectedThreadMessages.push(draft as Message);
            // }
            // selectedThread.messages = [...selectedThreadMessages];
            // this.setSelectedThread(selectedThread);
        }
        draftService.setDraftState({success: false, updatedDraft: null});
    }

    setThreadState(body: InitialThreadStateType) {
        this.dispatchAction(updateThreadState, body);
    }

    moveThreadToMailBox(mailBoxType: MailBoxTypes, snoozeDate: string = '') {
        let selectedThreadIds = this.getThreadState().multiSelection || [];
        let threads = this.getThreadState().threads || [];
        let showToaster = true;
        let remove_from_list = true;
        if (selectedThreadIds.length > 0) {
            const messagePlural = selectedThreadIds.length === 1 ? 'message' : 'messages'
            let movingThreads = threads.filter((thread: Thread) => selectedThreadIds.includes(thread.id!));
            let body: any = movingThreads.map((thread: Thread) => {
                let finalBody: any = {
                    id: thread.id,
                    fromTab: this.getThreadTabFromMailBoxes(thread.mailboxes || []),
                    ...this.getThreadMailBox(thread, mailBoxType),
                }
                if (mailBoxType === MAILBOX_SNOOZED) {
                    const targetDate = dayjs(snoozeDate)
                    const currentDate = dayjs();
                    finalBody.snooze = targetDate.diff(currentDate, 'second')
                }
                return finalBody;
            })
            let undoBody: any = movingThreads.map((thread: Thread) => {
                let finalBody: any = {
                    id: thread.id,
                    mailboxes: thread.mailboxes,
                    fromTab: this.getThreadTabFromMailBoxes(thread.mailboxes || []),
                    snooze: thread.snooze || null
                }
                return finalBody
            })
            let toastId = generateToasterId();
            if (mailBoxType === MAILBOX_UNREAD) {
                showToaster = false;
                remove_from_list = false;
            }
            let batchUpdateMoveBody = {
                body: {
                    body: {updates: body.map((t: any) => {
                            delete t.fromTab
                            return t
                        })}
                },
                ...(showToaster ? {
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
                            body: {updates: undoBody.map((t: any) => {
                                    delete t.fromTab
                                    return t
                                })},
                            tag: mailBoxType.toString().toLowerCase(),
                            afterUndoAction: () => {
                                this.setThreadState({threads: threads, selectedThread: threads[0]});
                                undoBody.forEach((data: any) => {
                                    this.moveThreadFromListToListCache(mailBoxType, data.fromTab, data.id);
                                })
                            }
                        },
                        showToasterAfterUndoClick: true
                    }
                } : {})
            }
            this.dispatchAction(batchUpdateThreads, batchUpdateMoveBody);
            if (remove_from_list) {
                let newFilteredThreads = threads.filter((thread: Thread) => !selectedThreadIds.includes(thread.id!))
                this.setThreadState({threads: newFilteredThreads, selectedThread: newFilteredThreads[0]});
                body.forEach((data: any) => {
                    this.moveThreadFromListToListCache(data.fromTab, mailBoxType, data.id);
                })
                this.cancelThreadSearch();
            } else {
                let newFilteredThreads = threads.map((thread: Thread) => {
                    if (selectedThreadIds.includes(thread.id!)) {
                        return {...thread, mailboxes: [...(thread.mailboxes || []), mailBoxType]}
                    }
                    return thread;
                })
                this.setThreadState({threads: newFilteredThreads});
                selectedThreadIds.forEach(id => {
                    this.makeThreadAsReadCache(id);
                })
            }
        }
    }

    addThreadToProject(item: Project, ref: any = null, allowComposeDraft: boolean = false) {
        let {multiSelection, selectedThread: currentSelectedThread, threads, tabValue} = this.getThreadState();
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
            let reqBody: any = {
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
            let projects = selectedThread?.projects || [];
            projects = [...projects, item];
            projects = projects.filter((obj: Project, index: number) => {
                return index === projects.findIndex((o: Project) => obj.id === o.id);
            })
            let addProject = {
                ...selectedThread,
                projects: projects
            }
            if (allowComposeDraft) {
                draftService.setComposeDraft(addProject)
                setTimeout(() => {
                    globalEventService.fireEvent({data: {body: 'add'}, type: 'richtexteditor.addRemoveProject'})
                }, 10)
                if (tabValue === 'DRAFT') {
                    let newThreads: Thread[] = threads ?? [];
                    if (threads) {
                        newThreads = [...threads];
                    }
                    threadsId?.forEach((ids: string) => {
                        let index1 = (threads || []).findIndex((thread: Thread) => thread.id === ids);
                        let threadProjects = newThreads[index1].projects || [];
                        threadProjects = [...threadProjects, item];
                        threadProjects = threadProjects.filter((obj: Project, index: number) => {
                            return index === threadProjects.findIndex((o: Project) => obj.id === o.id);
                        })
                        newThreads[index1] = {
                            ...newThreads[index1],
                            projects: threadProjects
                        }
                    })
                    this.setThreadState({threads: newThreads});
                }
            } else {
                let newThreads: Thread[] = threads ?? [];
                if (threads) {
                    newThreads = [...threads];
                }
                threadsId?.forEach((ids: string) => {
                    let index1 = (threads || []).findIndex((thread: Thread) => thread.id === ids);
                    let threadProjects = newThreads[index1].projects || [];
                    threadProjects = [...threadProjects, item];
                    threadProjects = threadProjects.filter((obj: Project, index: number) => {
                        return index === threadProjects.findIndex((o: Project) => obj.id === o.id);
                    })
                    newThreads[index1] = {
                        ...newThreads[index1],
                        projects: threadProjects
                    }
                })
                this.setSelectedThread(addProject);
                this.setThreadState({threads: newThreads});
            }
            projectService.updateThreadsCountInProject(item, reqBody.threadIds.length, 'add');
            this.updateThreadsCacheForProjects(reqBody.threadIds, item, 'add');
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
                                    setTimeout(() => {
                                        globalEventService.fireEvent({
                                            data: {body: 'remove'},
                                            type: 'richtexteditor.addRemoveProject'
                                        })
                                    }, 30)
                                    draftService.setComposeDraft(thread)
                                }
                                projectService.updateThreadsCountInProject(item, reqBody.threadIds.length, 'remove');
                                this.updateThreadsCacheForProjects(reqBody.threadIds, item, 'remove');
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
        let threadId = selectedThread.id;
        if (isComposing) {
            threadId = composeDraft?.threadId;
            selectedThread = composeDraft;
        }
        if (threadId) {
            let polyToast = generateToasterId();
            let reqBody: any = {
                threadIds: [threadId],
                roles: ['n/a'],
                groupType: 'project',
                groupId: item.id
            }
            projectService.updateThreadsCountInProject(item, 1, 'remove');
            this.updateThreadsCacheForProjects([threadId], item, 'remove');
            this.dispatchAction(removeThreadFromProject, {
                body: {
                    threadId: threadId,
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
                                let projects = selectedThread?.projects || [];
                                projects = [...projects, item];
                                projects = projects.filter((obj: Project, index: number) => {
                                    return index === projects.findIndex((o: Project) => obj.id === o.id);
                                })
                                let addProject = {
                                    ...selectedThread,
                                    projects: projects
                                }
                                setTimeout(() => {
                                    globalEventService.fireEvent({
                                        data: {body: 'add'},
                                        type: 'richtexteditor.addRemoveProject'
                                    })
                                }, 30)
                                draftService.setComposeDraft(addProject)
                            }
                            projectService.updateThreadsCountInProject(item, 1, 'add');
                            this.updateThreadsCacheForProjects([threadId], item, 'add');
                            this.setThreadState({selectedThread: selectedThread, threads: threads});
                            globalEventService.fireEvent({data: item, type: 'addToProject.add'});
                        }
                    },
                    showToasterAfterUndoClick: true
                }
            })

            if (!isComposing) {
                if (isOnProjectRoute && threads) {
                    let threadIndex = threads.findIndex((thread: Thread) => thread.id === threadId);
                    let data = threads.filter((thread: Thread) => thread.id !== threadId);
                    this.setThreadState({
                        selectedThread: threads[(threadIndex + 1 < threads.length) ? threadIndex + 1 : (threadIndex >= 0 ? threadIndex - 1 : threadIndex + 1)] || null,
                        threads: data
                    });
                } else {
                    let index1 = (threads || []).findIndex((thread: Thread) => thread.id === threadId);
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
                setTimeout(() => {
                    globalEventService.fireEvent({data: {body: 'remove'}, type: 'richtexteditor.addRemoveProject'})
                }, 10)
                let index1 = (threads || []).findIndex((thread: Thread) => thread.id === threadId);
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
        let {threads} = this.getThreadState();
        const mailboxes = (thread.mailboxes || [])
        const isUnread = mailboxes.includes('UNREAD');

        if (isUnread) {
            let updateTheList = [...(threads || [])];
            let findTheThreadToUpdate = updateTheList.findIndex((item: Thread) => item.id === thread.id);
            if (findTheThreadToUpdate !== -1) {
                updateTheList[findTheThreadToUpdate] = {
                    ...updateTheList[findTheThreadToUpdate],
                    mailboxes: mailboxes.filter(i => i !== 'UNREAD')
                }
                this.setThreads(updateTheList);
                this.setSelectedThread({...updateTheList[findTheThreadToUpdate]});
                this.setThreadState({success: true});
            }
            this.dispatchAction(updateThreads, {
                body: {
                    id: thread.id,
                    body: {mailboxes: mailboxes.filter(i => i !== 'UNREAD')}
                }
            });
            this.makeThreadAsReadCache(thread.id!);
        }
    }

    makeThreadAsReadCache(threadId: string) {
        let {tabValue} = this.getThreadState();
        let currentTabValue = tabValue || 'INBOX';
        let cacheThreads = {...cacheService.getThreadCache()};
        let cacheFromPage = cacheService.buildCacheKey(currentTabValue);
        let fromThreads = [...(cacheThreads[cacheFromPage] || [])];
        let threadIndex = fromThreads.findIndex((item) => item.id === threadId);
        if (threadIndex !== -1) {
            let mailBoxes = [...(fromThreads[threadIndex].mailboxes || [])];
            let mailBoxesIndex = mailBoxes.indexOf(MAILBOX_UNREAD);
            if (mailBoxesIndex !== -1) {
                mailBoxes.push(MAILBOX_UNREAD);
            } else {
                mailBoxes = mailBoxes.filter(i => i !== MAILBOX_UNREAD);
            }
            let updatingThread = {...fromThreads[threadIndex]};
            updatingThread.mailboxes = mailBoxes;
            fromThreads[threadIndex] = updatingThread;
            cacheService.setThreadCache({
                ...cacheThreads,
                [cacheFromPage]: fromThreads
            })
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

    updateThreadForUndoOrSend(type: string = 'send', emailBody: string = '') {
        let {draft, draftUndo} = draftService.getDraftState();
        let currentDraft = draft;
        if (type === 'undo') {
            currentDraft = draftUndo;
        }
        let {threads} = this.getThreadState();
        let convertMessages: Message = {
            ...currentDraft,
            draftInfo: {...currentDraft?.draftInfo, body: emailBody},
            mailboxes: type === 'undo' ? [MAILBOX_DRAFT] : [MAILBOX_SENT],
            snippet: currentDraft?.draftInfo?.body
        }
        if (currentDraft) {
            let addTargetBlank = emailBody.replace(/<a/g, '<a target="_blank"');
            const blob = new Blob([addTargetBlank], {type: "text/html"});
            convertMessages.body = window.URL.createObjectURL(blob);
            convertMessages.attachments = currentDraft?.draftInfo?.attachments || [];
            convertMessages.snippet = getPlainTextFromHtml(emailBody);
        }
        let currentThreads = [...(threads || [])];
        let selectedThread = currentThreads.find((item: Thread) => item.id === convertMessages.threadId);
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
        let threadIndex = currentThreads.findIndex((item: Thread) => item.id === selectedThread?.id);
        if (threadIndex !== -1) {
            let currentMessages = [...(currentThreads[threadIndex].messages || [])];
            let messageIndex = currentMessages.findIndex((item: Message) => item.id === convertMessages.id);
            currentMessages[messageIndex] = {
                ...currentMessages[messageIndex],
                ...convertMessages
            }
            currentThreads[threadIndex] = {...currentThreads[threadIndex]};
            currentThreads[threadIndex].messages = [...(currentThreads[threadIndex].messages || [])];
            currentThreads[threadIndex].messages = [...currentMessages];
            currentThreads[threadIndex].mailboxes = [...mailBoxes];

            let currentSelectedThread: Thread = {...selectedThread};
            let currentSelectedThreadMessages = [...(selectedThread?.messages || [])];
            messageIndex = currentSelectedThreadMessages.findIndex((item: Message) => item.id === convertMessages.id);
            currentSelectedThreadMessages[messageIndex] = {
                ...currentSelectedThreadMessages[messageIndex],
                ...convertMessages
            }
            currentSelectedThread.messages = [...currentSelectedThreadMessages];
            currentSelectedThread.mailboxes = [...mailBoxes];
            this.setThreads(currentThreads);
            this.setSelectedThread(currentSelectedThread);
            messageService.setMessages(currentSelectedThread.messages || []);
        }


        globalEventService.fireEvent('threads.refresh');

        if (type === 'send') {
            draftService.backupDraftForUndo();
        } else {
            draftService.restoreBackupDraft();
        }
    }

    performThreadsUpdateForDraftTab(currentDraft: MessageDraft | null | undefined) {
        let {threads} = this.getThreadState();
        let getDraftThreadToMove = (threads || []).find(obj => obj.id === currentDraft?.threadId);
        const newThreadArray = (threads || []).filter(obj => obj.id !== currentDraft?.threadId);
        this.setThreads(newThreadArray);
        let composeItem = newThreadArray[0];
        this.setSelectedThread(composeItem);
        commonService.toggleComposing(false);
        setTimeout(() => {
            if (composeItem && composeItem.messages && composeItem.messages[0]) {
                commonService.toggleComposing(true);
                let finalDraft = {...composeItem.messages[0], projects: [...(composeItem.projects || [])]}
                draftService.setComposeDraft(finalDraft);
            }
        }, 50);
        if (getDraftThreadToMove) {
            getDraftThreadToMove = {...getDraftThreadToMove};
            getDraftThreadToMove.mailboxes = ['SENT'];
            let cacheThreads = {...cacheService.getThreadCache()};
            let cachePage = cacheService.buildCacheKey('SENT');
            if (!cacheThreads[cachePage]) {
                cacheThreads[cachePage] = [];
            }
            let cacheTabThreads = [...cacheThreads[cachePage]];
            cacheTabThreads.unshift(getDraftThreadToMove);
            cacheService.setThreadCache({
                ...cacheThreads,
                [cachePage]: cacheTabThreads
            })
        }

    }

    performThreadsUndoForDraftTab(threadId: string) {
        let {threads, tabValue} = threadService.getThreadState();
        draftService.setComposeDraft(null);
        draftService.setResumeDraft(null);
        let cacheThreads = {...cacheService.getThreadCache()};
        let cacheSentPage = cacheService.buildCacheKey('SENT');
        let cacheDraftPage = cacheService.buildCacheKey('DRAFT');
        let sendThreads = [...cacheThreads[cacheSentPage]];
        let draftThreads = [...cacheThreads[cacheDraftPage]];
        let threadIndex = sendThreads.findIndex((item) => item.id === threadId);
        if (threadIndex !== -1) {
            let revertThread = {...sendThreads[threadIndex]};
            revertThread.mailboxes = ['DRAFT'];
            if (tabValue === 'DRAFT') {
                let draftsThreads = [...(threads || [])];
                draftsThreads.unshift(revertThread);
                this.setThreads(draftsThreads);
                this.setSelectedThread(revertThread);
                commonService.toggleComposing(false);
                setTimeout(() => {
                    commonService.toggleComposing(true);
                    if (revertThread && revertThread.messages && revertThread.messages[0]) {
                        let finalDraft = {
                            ...revertThread.messages[0],
                            projects: [...(revertThread.projects || [])],
                            updated: revertThread.messages[0].updated
                        }
                        draftService.setComposeDraft(finalDraft);
                    }
                }, 20);
            }
            sendThreads.splice(threadIndex, 1);
            draftThreads.unshift(revertThread);
            cacheService.setThreadCache({
                ...cacheThreads,
                [cacheDraftPage]: draftThreads,
                [cacheSentPage]: sendThreads
            })
        }
        if (tabValue === 'SENT') {
            this.setThreads(sendThreads);
        }
    }

    moveThreadFromListToListCache(from: string, to: string, threadId: string) {
        let cacheThreads = {...cacheService.getThreadCache()};
        let cacheFromPage = cacheService.buildCacheKey(from);
        let cacheToPage = cacheService.buildCacheKey(to);
        let fromThreads = [...(cacheThreads[cacheFromPage] || [])];
        let toThreads = [...(cacheThreads[cacheToPage] || [])];
        let threadIndex = fromThreads.findIndex((item) => item.id === threadId);
        if (threadIndex !== -1) {
            let mailBoxes = [...(fromThreads[threadIndex].mailboxes || [])];
            let mailBoxesIndex = mailBoxes.indexOf(to);
            if (mailBoxesIndex === -1 && to !== MAILBOX_ARCHIVE) {
                mailBoxes.push(to);
            }
            mailBoxesIndex = mailBoxes.indexOf(from);
            if (mailBoxesIndex !== -1) {
                mailBoxes.splice(mailBoxesIndex, 1);
            }
            let updatingThread = {...fromThreads[threadIndex]};
            updatingThread.mailboxes = mailBoxes;
            fromThreads.splice(threadIndex, 1);
            toThreads.unshift(updatingThread);
            cacheService.setThreadCache({
                ...cacheThreads,
                [cacheFromPage]: fromThreads,
                [cacheToPage]: toThreads
            })
        }
    }

    updateCacheWithThread(isNewThread: boolean, threadsToUpdate: Thread[], thread: Thread, selectedThread: Thread | null = null) {
        thread = {...thread};
        threadsToUpdate = [...threadsToUpdate];
        let findThreadIndex = threadsToUpdate.findIndex((item: Thread) => item.id === thread.id);
        if (findThreadIndex !== -1) {
            threadsToUpdate[findThreadIndex] = {...threadsToUpdate[findThreadIndex]};
        }
        if (isNewThread) {
            if (findThreadIndex !== -1) {
                threadsToUpdate[findThreadIndex].messages = [...(threadsToUpdate[findThreadIndex].messages || [])];
                let messages: Message[] = [...(threadsToUpdate[findThreadIndex].messages || [])];
                let newMessages: Message[] = [...(thread.messages || [])];
                newMessages = performMessagesUpdate(newMessages);
                newMessages.forEach((item: Message) => {
                    let index = messages.findIndex((t: Message) => t.id === item.id);
                    if (index === -1) {
                        messages.push(item);
                    }
                })
                threadsToUpdate[findThreadIndex].messages = [...messages];
                if (selectedThread && selectedThread.id === thread.id) {
                    messageService.setMessages(messages);
                }
            } else {
                let messages: Message[] = [...(thread.messages || [])];
                messages = performMessagesUpdate(messages);
                thread.messages = messages;
                threadsToUpdate.unshift(thread);
            }
        } else {
            if (findThreadIndex !== -1) {
                threadsToUpdate.splice(findThreadIndex, 1);
            }
            let messages: Message[] = [...(thread.messages || [])];
            messages = performMessagesUpdate(messages);
            thread.messages = messages;
            threadsToUpdate.unshift(thread);
        }
        return threadsToUpdate;
    }

    updateInboxPageCacheList(cacheThreads: any, cacheKey: any, thread: Thread, isNewThread: boolean) {
        let allMailboxToFindIn = (thread.mailboxes || []).filter((t: string) => ![MAILBOX_UNREAD, MAILBOX_STARRED].includes(t));
        let isProjectThread = (thread.projects || []).length > 0;
        let findThreadIndex = cacheThreads[cacheKey].findIndex((item: Thread) => item.id === thread.id);
        let tabValueFromCacheKey = cacheKey.split('-')[2];
        cacheThreads[cacheKey] = [...cacheThreads[cacheKey]];
        if (!allMailboxToFindIn.includes(tabValueFromCacheKey)) {
            if (findThreadIndex !== -1) {
                cacheThreads[cacheKey].splice(findThreadIndex, 1);
            } else {
                let messages: Message[] = [...(thread.messages || [])];
                messages = performMessagesUpdate(messages);
                thread.messages = messages;
                cacheThreads[cacheKey].unshift(thread);
            }
        } else {
            if (isProjectThread && cacheKey.includes('projects')) {
                cacheThreads[cacheKey] = [...this.updateCacheWithThread(isNewThread, cacheThreads[cacheKey], thread)];
            } else {
                if (cacheKey.includes('just-mine')) {
                    cacheThreads[cacheKey] = [...this.updateCacheWithThread(isNewThread, cacheThreads[cacheKey], thread)];
                }
            }
        }
        return cacheThreads[cacheKey];
    }

    updateProjectPageCacheList(cacheThreads: any, cacheKey: any, thread: Thread, isNewThread: boolean) {
        let allMailboxToFindIn = (thread.mailboxes || []).filter((t: string) => ![MAILBOX_UNREAD, MAILBOX_STARRED].includes(t));
        let isProjectThread = (thread.projects || []).length > 0;
        let findThreadIndex = cacheThreads[cacheKey].findIndex((item: Thread) => item.id === thread.id);
        let tabValueFromCacheKey = cacheKey.split('-')[2];
        cacheThreads[cacheKey] = [...cacheThreads[cacheKey]];
        if (!allMailboxToFindIn.includes(tabValueFromCacheKey)) {
            if (findThreadIndex !== -1) {
                cacheThreads[cacheKey].splice(findThreadIndex, 1);
            } else {
                let messages: Message[] = [...(thread.messages || [])];
                messages = performMessagesUpdate(messages);
                thread.messages = messages;
                cacheThreads[cacheKey].unshift(thread);
            }
        } else {
            let projectIds = [...(thread.projects || [])].map((p: Project) => p.id);
            if (projectIds.includes(cacheKey.split('-')[1])) {
                if (isProjectThread && cacheKey.includes('everything')) {
                    cacheThreads[cacheKey] = [...this.updateCacheWithThread(isNewThread, cacheThreads[cacheKey], thread)];
                } else {
                    if (cacheKey.includes('just-mine')) {
                        cacheThreads[cacheKey] = cacheThreads[cacheKey];
                    }
                }
            }
        }
        return cacheThreads[cacheKey];
    }

    findThreadInAllCacheListAndRemoveOrUpdateIt(thread: Thread, isNewThread: boolean) {
        let cacheThreads = {...cacheService.getThreadCache()};
        Object.keys(cacheThreads).forEach((cacheKey: string) => {
            if (cacheKey.startsWith('inbox-')) {
                cacheThreads[cacheKey] = [...this.updateInboxPageCacheList(cacheThreads, cacheKey, thread, isNewThread)];
            } else {
                cacheThreads[cacheKey] = [...this.updateProjectPageCacheList(cacheThreads, cacheKey, thread, isNewThread)];
            }

        })
        cacheService.setThreadCache(cacheThreads);
    }

    pushEventThreadToAppropriateList(thread: Thread, isNewThread: boolean, tabName: string) {
        let {tabValue, threads, selectedThread} = this.getThreadState();
        let currentTabValue = 'INBOX';
        if (tabValue) {
            currentTabValue = tabValue;
        }
        let allMailboxToFindIn = (thread.mailboxes || []).filter((t: string) => ![MAILBOX_UNREAD, MAILBOX_STARRED].includes(t));
        this.findThreadInAllCacheListAndRemoveOrUpdateIt(thread, isNewThread);
        let allowCallBack = false;
        if (allMailboxToFindIn.includes(currentTabValue)) {
            let finalThreads = [...(threads || [])];
            let isProjectThread = (thread.projects || []).length > 0;
            if (isProjectThread && (tabName === 'projects' || tabName === 'everything')) {
                allowCallBack = true;
                finalThreads = this.updateCacheWithThread(isNewThread, finalThreads, thread, selectedThread);
                threadService.setThreads(finalThreads);
            } else {
                if (tabName === 'just-mine') {
                    allowCallBack = true;
                    finalThreads = this.updateCacheWithThread(isNewThread, finalThreads, thread, selectedThread);
                    threadService.setThreads(finalThreads);
                }
            }
        }
        return allowCallBack;
    }

    threadUpdated(thread: Thread) {
        let {tabValue, threads, selectedThread} = this.getThreadState();
        let currentTabValue = 'INBOX';
        if (tabValue) {
            currentTabValue = tabValue;
        }
        let allMailboxToFindIn = (thread.mailboxes || []);
        let removableThread = this.updateThreadToProperPlaceInCache(thread);
        let finalThreads = [...(threads || [])];
        let findThreadIndex = finalThreads.findIndex((item: Thread) => item.id === thread.id);
        if (allMailboxToFindIn.includes(currentTabValue)) {
            if (findThreadIndex !== -1) {
                finalThreads[findThreadIndex] = {
                    ...finalThreads[findThreadIndex],
                    mailboxes: thread.mailboxes
                }
            } else {
                if (removableThread) {
                    finalThreads.unshift({...removableThread, mailboxes: thread.mailboxes});
                } else {
                    let messages: Message[] = [...(thread.messages || [])];
                    messages = performMessagesUpdate(messages);
                    thread.messages = messages;
                    finalThreads.unshift(thread);
                }
            }
            if (selectedThread && selectedThread.id === thread.id) {
                this.setSelectedThread({...selectedThread, mailboxes: thread.mailboxes});
            }
        } else {
            if (findThreadIndex !== -1) {
                if (selectedThread && selectedThread.id === thread.id) {
                    let finalIndex = (findThreadIndex - 1 < finalThreads.length) ? (findThreadIndex === 0) ? findThreadIndex : findThreadIndex - 1 : (findThreadIndex <= 0 ? findThreadIndex + 1 : findThreadIndex - 1)
                    this.setSelectedThread(finalThreads[finalIndex]);
                }
                finalThreads.splice(findThreadIndex, 1);
            }
        }
        this.setThreads(finalThreads);
    }

    updateThreadToProperPlaceInCache(thread: Thread) {
        let cacheThreads = {...cacheService.getThreadCache()};
        let threadsToRemove: any = {...this.getThreadsToRemoveFromCache(cacheThreads, thread)};
        let removableThread: Thread | null = null;
        if (Object.keys(threadsToRemove).length > 0) {
            removableThread = threadsToRemove[Object.keys(threadsToRemove)[0]];
        }
        cacheThreads = this.updateThreadsToCache(cacheThreads, thread, removableThread);
        cacheService.setThreadCache(cacheThreads);
        return removableThread;
    }

    getThreadsToRemoveFromCache(cacheThreads: any, thread: Thread) {
        let threadsToRemove: any = {};
        let allMailboxToFindIn = (thread.mailboxes || []);
        Object.keys(cacheThreads).forEach((cacheKey: string) => {
            let findThreadIndex = cacheThreads[cacheKey].findIndex((item: Thread) => item.id === thread.id);
            let tabValueFromCacheKey = cacheKey.split('-')[2];
            if (!allMailboxToFindIn.includes(tabValueFromCacheKey)) {
                if (findThreadIndex !== -1) {
                    threadsToRemove[cacheKey] = {...cacheThreads[cacheKey][findThreadIndex]};
                }
            }
        })
        return threadsToRemove;
    }

    updateThreadsToCache(cacheThreads: any, thread: Thread, removeThead: Thread | null) {
        let allMailboxToFindIn = (thread.mailboxes || []);
        let isProjectThread = (thread.projects || []).length > 0;
        Object.keys(cacheThreads).forEach((cacheKey: string) => {
            cacheThreads[cacheKey] = [...cacheThreads[cacheKey]];
            let findThreadIndex = cacheThreads[cacheKey].findIndex((item: Thread) => item.id === thread.id);
            let tabValueFromCacheKey = cacheKey.split('-')[2];
            if (allMailboxToFindIn.includes(tabValueFromCacheKey)) {
                if (isProjectThread && (cacheKey.includes('projects') || cacheKey.includes('everything'))) {
                    if (findThreadIndex !== -1) {
                        cacheThreads[cacheKey][findThreadIndex] = {
                            ...cacheThreads[cacheKey][findThreadIndex],
                            mailboxes: thread.mailboxes
                        };
                    } else {
                        if (removeThead) {
                            cacheThreads[cacheKey].unshift({...removeThead, mailboxes: thread.mailboxes});
                        } else {
                            let messages: Message[] = [...(thread.messages || [])];
                            messages = performMessagesUpdate(messages);
                            thread.messages = messages;
                            cacheThreads[cacheKey].unshift(thread);
                        }
                    }
                } else {
                    if (cacheKey.includes('just-mine')) {
                        if (findThreadIndex !== -1) {
                            cacheThreads[cacheKey][findThreadIndex] = {
                                ...cacheThreads[cacheKey][findThreadIndex],
                                mailboxes: thread.mailboxes
                            };
                        } else {
                            if (removeThead) {
                                cacheThreads[cacheKey].unshift({...removeThead, mailboxes: thread.mailboxes});
                            } else {
                                let messages: Message[] = [...(thread.messages || [])];
                                messages = performMessagesUpdate(messages);
                                thread.messages = messages;
                                cacheThreads[cacheKey].unshift(thread);
                            }
                        }
                    }
                }
            }
        })
        return cacheThreads
    }

    markMultipleThreadsAsMute() {
        let selectedThreadIds = this.getThreadState().multiSelection || [];
        let threads = this.getThreadState().threads || [];
        let selectedThread = this.getThreadState().selectedThread;
        let updatingThreads = threads.filter((t: Thread) => selectedThreadIds.includes(t.id!));
        let whatToMark = false;
        let allMuted = updatingThreads.filter((t: Thread) => t.mute);
        let allUnMuted = updatingThreads.filter((t: Thread) => !t.mute);
        if (allMuted.length > 0 && allUnMuted.length > 0) {
            whatToMark = true;
        } else if (allUnMuted.length <= 0 && allMuted.length > 0) {
            whatToMark = false;
        } else {
            whatToMark = true;
        }
        if (selectedThreadIds.length > 0) {
            // const messagePlural = selectedThreadIds.length === 1 ? 'message' : 'messages'
            let body: any = {
                mute: whatToMark,
                threadIds: selectedThreadIds,
            }
            // let toastId = generateToasterId();
            let batchUpdateMoveBody = {
                body: {body},
                // toaster: {
                //     success: {
                //         desc: `Your threads has been ${whatToMark ? 'muted' : 'Un muted'}`,
                //         title: `${selectedThreadIds.length} ${messagePlural} has been ${whatToMark ? 'muted' : 'Un muted'}`,
                //         type: 'undo_changes',
                //         id: toastId,
                //     }
                // },
                // undoAction: {
                //     showUndoButton: true,
                //     dispatch: this.getDispatch(),
                //     action: batchUpdateThreads,
                //     success: {
                //         type: 'success',
                //         desc: `Your threads has been ${whatToMark ? 'un-muted' : 'muted'}`,
                //         title: `${selectedThreadIds.length} ${messagePlural} has been ${whatToMark ? 'un-muted' : 'muted'}`
                //     },
                //     undoBody: {
                //         body: {mute: !whatToMark, threadIds: selectedThreadIds},
                //         afterUndoAction: () => {
                //             this.setThreadState({threads: threads});
                //             if (selectedThread && selectedThreadIds.includes(selectedThread.id!)) {
                //                 this.setSelectedThread({...selectedThread, mute: !whatToMark})
                //             }
                //             selectedThreadIds.forEach(id => {
                //                 this.makeThreadAsMuteCache(id, !whatToMark);
                //             })
                //         }
                //     },
                //     showToasterAfterUndoClick: true
                // }
            }
            this.dispatchAction(batchUpdateThreads, batchUpdateMoveBody);
            let newFilteredThreads = threads.map((thread: Thread) => {
                if (selectedThreadIds.includes(thread.id!)) {
                    return {...thread, mute: whatToMark}
                }
                return thread;
            })
            this.setThreadState({threads: newFilteredThreads});
            if (selectedThread && selectedThreadIds.includes(selectedThread.id!)) {
                this.setSelectedThread({...selectedThread, mute: whatToMark})
            }
            selectedThreadIds.forEach(id => {
                this.makeThreadAsMuteCache(id, whatToMark);
            })
        }
    }

    makeThreadAsMuteCache(threadId: string, mute: boolean) {
        let {tabValue} = this.getThreadState();
        let currentTabValue = tabValue || 'INBOX';
        let cacheThreads = {...cacheService.getThreadCache()};
        let cacheFromPage = cacheService.buildCacheKey(currentTabValue);
        let fromThreads = [...(cacheThreads[cacheFromPage] || [])];
        let threadIndex = fromThreads.findIndex((item) => item.id === threadId);
        if (threadIndex !== -1) {
            let updatingThread = {...fromThreads[threadIndex]};
            updatingThread.mute = mute;
            fromThreads[threadIndex] = updatingThread;
            cacheService.setThreadCache({
                ...cacheThreads,
                [cacheFromPage]: fromThreads
            })
        }
    }

    getThreadMailBox(selectedThread: Thread, messageBox: string) {
        let body: any = {
            mailboxes: selectedThread.mailboxes
        };
        switch (messageBox) {
            case MAILBOX_INBOX:
                if (selectedThread.mailboxes?.includes(messageBox)) {
                    return
                }
                body.mailboxes = body.mailboxes.filter((item: string) => ![MAILBOX_ARCHIVE, MAILBOX_TRASH, MAILBOX_SPAM].includes(item))
                body.mailboxes = [...body.mailboxes, messageBox]
                break;
            case MAILBOX_TRASH:
                if (selectedThread.mailboxes?.includes(messageBox)) {
                    return
                }
                body.mailboxes = body.mailboxes.filter((item: string) => ![MAILBOX_INBOX, MAILBOX_ARCHIVE, MAILBOX_SPAM].includes(item))
                body.mailboxes = [...body.mailboxes, messageBox]
                break;
            case MAILBOX_ARCHIVE:
                if (selectedThread.mailboxes?.includes(messageBox)) {
                    return
                }
                body.mailboxes = body.mailboxes.filter((item: string) => ![MAILBOX_INBOX, MAILBOX_TRASH, MAILBOX_SPAM].includes(item))
                break;
            case MAILBOX_SPAM:
                if (selectedThread.mailboxes?.includes(messageBox)) {
                    return
                }
                body.mailboxes = [messageBox]
                body.snooze = null;
                break;
            case MAILBOX_STARRED:
                if (selectedThread.mailboxes?.includes(messageBox)) {
                    body.mailboxes = body.mailboxes.filter((item: string) => item !== messageBox)
                } else {
                    body.mailboxes = [...body.mailboxes, messageBox]
                }
                break;
            case MAILBOX_UNREAD:
                if (selectedThread.mailboxes?.includes(messageBox)) {
                    body.mailboxes = body.mailboxes.filter((item: string) => item !== messageBox)
                } else {
                    body.mailboxes = [...body.mailboxes, messageBox]
                }
                break;
            case MAILBOX_SNOOZED:
                if (selectedThread.mailboxes?.includes(messageBox)) {
                    return
                }
                body.mailboxes = body.mailboxes.filter((item: string) => ![MAILBOX_INBOX, MAILBOX_TRASH, MAILBOX_SPAM].includes(item))
                body.mailboxes = [...body.mailboxes, messageBox]
                break;
        }
        return body;
    }

    getThreadTabFromMailBoxes(mailBoxes: string[]) {
        if (mailBoxes.includes(MAILBOX_INBOX)) {
            return MAILBOX_INBOX;
        }
        if (mailBoxes.includes(MAILBOX_TRASH)) {
            return MAILBOX_TRASH;
        }
        if (mailBoxes.includes(MAILBOX_SPAM)) {
            return MAILBOX_SPAM;
        }
        if (mailBoxes.includes(MAILBOX_SNOOZED)) {
            return MAILBOX_SNOOZED;
        }
        return MAILBOX_ARCHIVE;
    }

    updateThreadsCacheForProjects(threadIds: string[], project: Project, type: string) {
        let cacheThreads = {...cacheService.getThreadCache()};
        Object.keys(cacheThreads).forEach(key => {
            cacheThreads[key] = [...cacheThreads[key]];
            cacheThreads[key].forEach((item: Thread, index: number) => {
                if (threadIds.includes(item.id!)) {
                    if (type === 'add') {
                        cacheThreads[key][index] = {
                            ...cacheThreads[key][index],
                            projects: [...(cacheThreads[key][index]['projects'] || []), project]
                        }
                    } else {
                        cacheThreads[key][index] = {...cacheThreads[key][index]}
                        cacheThreads[key][index].projects = (cacheThreads[key][index].projects || []).filter((p: Project) => p.id !== project.id);
                    }
                }
            })
        })
        cacheService.setThreadCache(cacheThreads);
    }
}

export const threadService = new ThreadsService();
