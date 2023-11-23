import {useDispatch, useSelector} from "react-redux";
import {StateType} from "@/types";
import {useCallback, useEffect} from "react";
import {
    accountService,
    commonService, draftService, globalEventService, projectService,
    socketService,
    threadService
} from "@/services";
import {Message, Thread} from "@/models";
import {performMessagesUpdate} from "@/utils/thread.functions";
import {getAllMessages} from "@/redux/messages/action-reducer";
import {ACTIVITY_FEED_EVENT_TYPES, SOCKET_ACTIVITY_EVENTS, SOCKET_EVENTS} from "@/utils/constants";
import {Toaster} from "@/components/common/toaster";
import Router from "next/router";
import {getAllProjects} from "@/redux/projects/action-reducer";

export function SocketEvents() {
    const {newMessage} = useSelector((state: StateType) => state.socket);
    const {threads} = useSelector((state: StateType) => state.threads);
    const {accounts, selectedAccount} = useSelector((state: StateType) => state.accounts);
    const dispatch = useDispatch();

    const reAuthToast = useCallback(
        (email: string) => {
            Toaster({
                id: 'REAUTH',
                title: 'Please reauthenticate your account.',
                desc: `Your session has expired for ${email}.`,
                type: 'reauth',
                onClick: () => {
                    Router.push('/settings/email-address');
                }
            });

            Router.push('/settings/email-address');
        },
        [],
    );

    const fireNotification = useCallback(({title, subtitle, tag}: { title: string, subtitle: string, tag: string }) => {
        globalEventService.fireEventWithDelay({
            type: 'show-notification',
            data: {title, data: {body: subtitle, tag: tag}}
        })
    }, [])

    const activityEvent = useCallback((type: string, data: any) => {
        if (ACTIVITY_FEED_EVENT_TYPES.includes(type)) {
            switch (type) {
                case SOCKET_ACTIVITY_EVENTS.THREAD_SHARED:
                    fireNotification({
                        title: `${data.Username} ${data.Title}`,
                        subtitle: data.Subtitle,
                        tag: `${data.Type}-${data.Created}`
                    });
                    break;
                case SOCKET_ACTIVITY_EVENTS.PROJECT_INVITE:
                    fireNotification({
                        title: `${data.Username} ${data.Title}`,
                        subtitle: data.Subtitle,
                        tag: `${data.Type}-${data.Created}`
                    });
                    break;
                case SOCKET_ACTIVITY_EVENTS.MEMBER_JOINED:
                    fireNotification({
                        title: `${data.Username} ${data.Title}`,
                        subtitle: data.Subtitle,
                        tag: `${data.Type}-${data.Created}`
                    });
                    dispatch(getAllProjects({noBlank: true}));
                    globalEventService.fireEventWithDelay('threads.refresh');
                    break;
                case SOCKET_ACTIVITY_EVENTS.PROJECT_DELETED:
                    projectService.processProjectDeletedActivity(data);
                    break;
                case SOCKET_ACTIVITY_EVENTS.MEMBER_LEFT:
                    projectService.processMemberActivity(data);
                    break;
            }
            globalEventService.fireEventWithDelay({type: 'activity.new', data})
        }
    }, [dispatch, fireNotification])

    useEffect(() => {
        if (newMessage) {
            console.log('---NEW EVENT---', newMessage);
            socketService.updateSocketMessage(null);
            let activityName = newMessage.name;
            switch (activityName) {
                case SOCKET_EVENTS.SEARCH_RESULT:
                    if (newMessage?.data) {
                        Object.keys(newMessage?.data).map((id: string) => {
                            let newThread = {
                                ...newMessage.data[id],
                                id: newMessage.data[id]._id,
                            };
                            if (newThread.messages && newThread.messages.length > 0) {
                                newThread.messages = newThread.messages.map((t: Message) => ({...t, id: t._id}));
                                newThread.messages = newThread.messages.sort((a: Message, b: Message) => new Date(b.created as string).valueOf() - new Date(a.created as string).valueOf());
                                newThread.messages = performMessagesUpdate(newThread.messages);
                            }
                            threadService.setThreadState({threads: [...(threads || []), newThread]})
                        });
                    }
                    break;
                case SOCKET_EVENTS.REAUTHENTICATE:
                    if (newMessage.data && accounts!.length > 0) {
                        let finalAccounts = [...(accounts || [])];
                        let accountForReAuth = finalAccounts.findIndex(account => account.id === newMessage.data.account._id)!;
                        if (accountForReAuth !== -1) {
                            finalAccounts[accountForReAuth] = {
                                ...finalAccounts[accountForReAuth],
                                status: 'invalid'
                            }
                            accountService.setAccounts(finalAccounts);
                            reAuthToast(finalAccounts[accountForReAuth].email!);
                        }
                    }
                    break;
                case SOCKET_EVENTS.INIT_SYNC_PROGRESS:
                    if (newMessage?.data) {
                        if (selectedAccount && selectedAccount.id === newMessage.data.accountId) {
                            if (newMessage.data.progress < 100) {
                                commonService.updateEmailSyncPercentage(Math.floor(newMessage.data.progress));
                            } else {
                                commonService.updateEmailSyncPercentage(null);
                                accountService.setSelectedAccount({
                                    ...selectedAccount,
                                    syncHistory: {mailInitSynced: new Date().toString()}
                                });
                                accountService.updateValuesFromAccount(selectedAccount, true);
                            }
                        }
                    }
                    break;
                case SOCKET_EVENTS.DRAFT_CREATED:
                    dispatch(getAllMessages)
                    break;
                case SOCKET_EVENTS.ACTIVITY:
                    activityEvent(newMessage.data.Type, newMessage.data)
                    break;
                case SOCKET_EVENTS.DRAFT_DELETED:
                    draftService.discardDraft(newMessage.data.id);
                    globalEventService.fireEventWithDelay('draft.setNull');
                    break;
                case SOCKET_EVENTS.NEW_MESSAGE:
                    const newThread = newMessage.data.thread as Thread
                    globalEventService.fireEventWithDelay({
                        type: 'threads.update',
                        data: {thread: newThread, type: 'new'}
                    })
                    if (newThread.mute) {
                        return;
                    }
                    var userName = newThread?.from?.name || newThread?.from?.email
                    fireNotification({
                        title: "New message from " + userName,
                        subtitle: `${newThread?.subject}`,
                        tag: `${newThread?.updated}`
                    })
                    break;
                case SOCKET_EVENTS.SNOOZED_THREAD:
                    const snoozedMessage = newMessage.data.thread as Thread
                    globalEventService.fireEventWithDelay({
                        type: 'threads.update',
                        data: {thread: snoozedMessage, type: 'snooze'}
                    })
                    if (snoozedMessage.mute) {
                        return;
                    }
                    fireNotification({
                        title: snoozedMessage.subject || "You got a new message",
                        subtitle: `${snoozedMessage.from?.name} ${snoozedMessage.from?.email}`,
                        tag: `${snoozedMessage?.updated}`
                    })
                    break;
                case SOCKET_EVENTS.THREAD_UPDATED:
                    let thread: Thread = {...newMessage.data.thread};
                    thread = {...thread, id: thread._id};
                    threadService.threadUpdated(thread);
                    break;
            }
        }
    }, [accounts, newMessage, threads, reAuthToast, selectedAccount, dispatch, activityEvent, fireNotification]);

    return null;
}
