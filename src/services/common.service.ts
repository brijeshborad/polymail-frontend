import {BaseService} from "@/services/base.service";
import {InitialCommonApisStateType} from "@/types";
import {updateCommonState} from "@/redux/common-apis/action-reducer";
import {Thread, UserProjectOnlineStatus} from "@/models";
import {getMemberStatusCache, setMemberStatusCache} from "@/utils/cache.functions";
import dayjs from "dayjs";
import {userService} from "@/services/user.service";
import customParseFormat from "dayjs/plugin/customParseFormat";
dayjs.extend(customParseFormat)

class CommonService extends BaseService {
    constructor() {
        super();
    }

    public getCommonState(): InitialCommonApisStateType {
        return this.getState('commonApis');
    }

    toggleComposing(enable: boolean) {
        this.setCommonState({isComposing: enable});
    }

    toggleComposingWithThreadSelection(enable: boolean, allowSelection: boolean) {
        this.setCommonState({isComposing: enable, allowThreadSelection: allowSelection})
    }

    setCommonState(body: InitialCommonApisStateType) {
        this.dispatchAction(updateCommonState, body);
    }

    updateUserOnlineStatus(oldThread: Thread, newThread: Thread) {
        let oldThreadOnlineUser: UserProjectOnlineStatus | null = null;
        let onlineMembers: any = {...getMemberStatusCache()};
        onlineMembers['threads'] = {...onlineMembers['threads']};
        let oldThreadId: string = oldThread.id!;
        let newThreadId: string = newThread.id!;
        if (!onlineMembers['threads'][oldThreadId]) {
            onlineMembers['threads'][oldThreadId] = [];
        } else {
            onlineMembers['threads'][oldThreadId] = [...onlineMembers['threads'][oldThreadId]];
        }
        if (!onlineMembers['threads'][newThreadId]) {
            onlineMembers['threads'][newThreadId] = [];
        } else {
            onlineMembers['threads'][newThreadId] = [...onlineMembers['threads'][newThreadId]];
        }
        let findOldThreadUserIndex = onlineMembers['threads'][oldThreadId].findIndex((item: UserProjectOnlineStatus) => item.userId === oldThread.user);
        if (findOldThreadUserIndex !== -1) {
            onlineMembers['threads'][oldThreadId][findOldThreadUserIndex] = {...onlineMembers['threads'][oldThreadId][findOldThreadUserIndex]};
            oldThreadOnlineUser = onlineMembers['threads'][oldThreadId][findOldThreadUserIndex];
            onlineMembers['threads'][oldThreadId][findOldThreadUserIndex].isOnline = false;
            onlineMembers['threads'][oldThreadId][findOldThreadUserIndex].forceWait = 2;
        }

        let findNewThreadUserIndex = onlineMembers['threads'][newThreadId].findIndex((item: UserProjectOnlineStatus) => item.userId === newThread.user);
        if (findNewThreadUserIndex !== -1) {
            onlineMembers['threads'][newThreadId][findNewThreadUserIndex] = {...onlineMembers['threads'][newThreadId][findNewThreadUserIndex]};
            onlineMembers['threads'][newThreadId][findNewThreadUserIndex].isOnline = true;
            onlineMembers['threads'][newThreadId][findNewThreadUserIndex].lastOnlineStatusCheck = dayjs().format('DD/MM/YYYY hh:mm:ss a');
            onlineMembers['threads'][newThreadId][findNewThreadUserIndex].forceWait = 0;
        } else {
            let {userDetails, profilePicture} = userService.getUserState();
            if (!oldThreadOnlineUser && userDetails) {
                oldThreadOnlineUser = {
                    userId: userDetails.id,
                    avatar: (profilePicture?.url || ''),
                    color: Math.floor(Math.random() * 16777215).toString(16),
                    name: (userDetails.firstName || '') + ' ' + (userDetails.lastName || ' '),
                }
            }
            onlineMembers['threads'][newThreadId].push({
                ...oldThreadOnlineUser,
                isOnline: true,
                lastOnlineStatusCheck: dayjs().format('DD/MM/YYYY hh:mm:ss a'),
                forceWait: 0
            })
        }
        onlineMembers = {...this.removeAllOtherOnlineStatusForUser(onlineMembers, [oldThreadId, newThreadId], newThread.user)}
        setMemberStatusCache(onlineMembers);
        this.setCommonState({onlineUsers: onlineMembers});
    }

    removeAllOtherOnlineStatusForUser(onlineMembers: any, ignoreThreadIds: string[], userId: string | undefined) {
        Object.keys(onlineMembers['threads']).forEach((threadId: string) => {
            if (!ignoreThreadIds.includes(threadId)) {
                onlineMembers['threads'][threadId] = [...onlineMembers['threads'][threadId]];
                onlineMembers['threads'][threadId].forEach((user: UserProjectOnlineStatus, index: number) => {
                    onlineMembers['threads'][threadId][index] = {...onlineMembers['threads'][threadId][index]};
                    if (userId && user.userId === userId) {
                        onlineMembers['threads'][threadId][index].isOnline = false;
                    }
                })
            }
        })
        return onlineMembers;
    }

    updateUserOnlineStatusWithSocketEvent(newMessage: any) {
        if (newMessage.name === 'Activity') {
            let onlineUsers: any = {...getMemberStatusCache()};
            let type = '';
            let id = '';
            if (newMessage.data.type === 'ViewingThread') {
                type = 'threads';
                id = newMessage.data.threadId;
            }
            if (newMessage.data.type === 'ViewingProject') {
                type = 'projects';
                id = newMessage.data.projectId;
            }
            if (!type || !id) {
                return;
            }
            onlineUsers[type] = {
                ...onlineUsers[type],
                ...(!onlineUsers[type][id] ? {[id]: []} : {[id]: [...onlineUsers[type][id]]})
            };
            let userAlreadyExists = onlineUsers[type][id].findIndex((item: UserProjectOnlineStatus) => item.userId === newMessage.data.userId);
            if (userAlreadyExists !== -1) {
                if (onlineUsers[type][id][userAlreadyExists].forceWait > 0) {
                    onlineUsers[type][id][userAlreadyExists] = {
                        ...onlineUsers[type][id][userAlreadyExists],
                        forceWait: onlineUsers[type][id][userAlreadyExists].forceWait - 1
                    }
                } else {
                    onlineUsers[type][id][userAlreadyExists] = {
                        ...onlineUsers[type][id][userAlreadyExists],
                        isOnline: true,
                        lastOnlineStatusCheck: dayjs().format('DD/MM/YYYY hh:mm:ss a'),
                        forceWait: 0
                    }
                }
            } else {
                onlineUsers[type][id].push({
                    userId: newMessage.data.userId,
                    isOnline: true,
                    lastOnlineStatusCheck: dayjs().format('DD/MM/YYYY hh:mm:ss a'),
                    avatar: newMessage.data.avatar,
                    color: Math.floor(Math.random() * 16777215).toString(16),
                    name: newMessage.data.name,
                    forceWait: 0
                })
            }
            setMemberStatusCache(onlineUsers);
            this.setCommonState({onlineUsers: onlineUsers});
        }
    }

    updateUserOnlineStatusOnInterval() {
        let onlineMembers: any = {...getMemberStatusCache()};
        Object.keys(onlineMembers).forEach((item: string) => {
            onlineMembers[item] = {...onlineMembers[item]};
            Object.keys(onlineMembers[item]).forEach((itemObj: string) => {
                onlineMembers[item][itemObj] = [...onlineMembers[item][itemObj]];
                onlineMembers[item][itemObj].forEach((user: object, index: number) => {
                    onlineMembers[item][itemObj][index] = {...onlineMembers[item][itemObj][index]};
                    let lastActiveDate = dayjs(onlineMembers[item][itemObj][index].lastOnlineStatusCheck, 'DD/MM/YYYY hh:mm:ss a');
                    if (onlineMembers[item][itemObj][index].isOnline && dayjs().diff(lastActiveDate, 'seconds') > 10) {
                        onlineMembers[item][itemObj][index].isOnline = false;
                    }
                })
            })
        })
        setMemberStatusCache(onlineMembers);
        this.setCommonState({onlineUsers: onlineMembers});
    }

    updateEmailSyncPercentage(percentage: number | null) {
        this.setCommonState({syncingEmails: percentage});
    }

    toggleCreateProjectModel(enable: boolean, shouldRedirect: boolean = false) {
        this.setCommonState({showCreateProjectModal: enable, shouldRedirectOnCreateProject: shouldRedirect});
    }
}

export const commonService = new CommonService();
