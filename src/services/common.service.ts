import {BaseService} from "@/services/base.service";
import {InitialCommonApisStateType} from "@/types";
import {updateCommonState} from "@/redux/common-apis/action-reducer";
import {Project, Thread, UserProjectOnlineStatus} from "@/models";
import {getMemberStatusCache, setMemberStatusCache} from "@/utils/cache.functions";
import dayjs from "dayjs";
import {userService} from "@/services/user.service";
import customParseFormat from "dayjs/plugin/customParseFormat";
import {authService} from "@/services/auth.service";
import {accountService} from "@/services/account.service";
import {organizationService} from "@/services/organization.service";
import LocalStorageService from "@/utils/localstorage.service";
import {keyNavigationService} from "@/services/key-action.service";
import {SOCKET_ACTIVITY_EVENTS, SOCKET_EVENTS} from "@/utils/constants";

dayjs.extend(customParseFormat)

class CommonService extends BaseService {
    userColorStatus: { [key: string]: string } = {};

    constructor() {
        super();
    }

    public getCommonState(): InitialCommonApisStateType {
        return this.getState('commonApis');
    }

    toggleComposing(enable: boolean) {
        if (!enable) {
            this.setCommonState({animateCompose: true});
            setTimeout(() => {
                this.setCommonState({animateCompose: false});
                this.setCommonState({isComposing: enable});
            }, 500)
        } else {
            this.setCommonState({isComposing: enable});
        }

    }

    toggleComposingWithThreadSelection(enable: boolean, allowSelection: boolean) {
        this.setCommonState({allowThreadSelection: allowSelection});
        this.toggleComposing(enable);
    }

    setCommonState(body: InitialCommonApisStateType) {
        this.dispatchAction(updateCommonState, body);
    }

    getUserColor(userId: string) {
        if (!this.userColorStatus[userId]) {
            this.userColorStatus[userId] = Math.floor(Math.random() * 16777215).toString(16);
        }
        return this.userColorStatus[userId];
    }

    updateUserOnlineStatusProject(newProject: Project) {
        let onlineMembers: any = {...getMemberStatusCache()};
        onlineMembers['projects'] = {...onlineMembers['projects']};
        let newProjectId: string = newProject.id!;
        if (!onlineMembers['projects'][newProjectId]) {
            onlineMembers['projects'][newProjectId] = [];
        } else {
            onlineMembers['projects'][newProjectId] = [...onlineMembers['projects'][newProjectId]];
        }
        let {userDetails, profilePicture} = userService.getUserState();
        if (userDetails) {
            let findNewThreadUserIndex = onlineMembers['projects'][newProjectId].findIndex((item: UserProjectOnlineStatus) => item.userId === userDetails?.id);
            if (findNewThreadUserIndex !== -1) {
                onlineMembers['projects'][newProjectId][findNewThreadUserIndex] = {...onlineMembers['projects'][newProjectId][findNewThreadUserIndex]};
                onlineMembers['projects'][newProjectId][findNewThreadUserIndex].isOnline = true;
                onlineMembers['projects'][newProjectId][findNewThreadUserIndex].lastOnlineStatusCheck = dayjs().format('DD/MM/YYYY hh:mm:ss a');
                onlineMembers['projects'][newProjectId][findNewThreadUserIndex].forceWait = 0;
            } else {
                onlineMembers['projects'][newProjectId].push({
                    userId: userDetails.id,
                    avatar: (profilePicture?.url || ''),
                    color: userDetails?.color || this.getUserColor(userDetails.id!),
                    name: (userDetails.firstName || '') + ' ' + (userDetails.lastName || ' '),
                    isOnline: true,
                    lastOnlineStatusCheck: dayjs().format('DD/MM/YYYY hh:mm:ss a'),
                    forceWait: 0
                })
            }
            onlineMembers = {...this.removeAllOtherOnlineStatusForUserProject(onlineMembers, [newProjectId], userDetails.id)}
            setMemberStatusCache(onlineMembers);
            this.setCommonState({onlineUsers: onlineMembers});
        }
    }

    removeAllOtherOnlineStatusForUserProject(onlineMembers: any, ignoreThreadIds: string[], userId: string | undefined) {
        onlineMembers['projects'] = {...onlineMembers['projects']};
        let {userDetails} = userService.getUserState();
        let setStatus = false;
        if (userId === 'me') {
            setStatus = true;
            userId = userDetails?.id;
        }
        Object.keys(onlineMembers['projects']).forEach((projectId: string) => {
            if (!ignoreThreadIds.includes(projectId)) {
                onlineMembers['projects'][projectId] = [...onlineMembers['projects'][projectId]];
                onlineMembers['projects'][projectId].forEach((user: UserProjectOnlineStatus, index: number) => {
                    onlineMembers['projects'][projectId][index] = {...onlineMembers['projects'][projectId][index]};
                    if (userId && user.userId === userId) {
                        onlineMembers['projects'][projectId][index].isOnline = false;
                        onlineMembers['projects'][projectId][index].forceWait = 2;
                    }
                })
            }
        })
        if (setStatus) {
            setMemberStatusCache(onlineMembers);
            this.setCommonState({onlineUsers: onlineMembers});
        }
        return onlineMembers;
    }

    updateUserOnlineStatus(newThread: Thread) {
        let onlineMembers: any = {...getMemberStatusCache()};
        onlineMembers['threads'] = {...onlineMembers['threads']};
        let newThreadId: string = newThread.id!;
        if (!onlineMembers['threads'][newThreadId]) {
            onlineMembers['threads'][newThreadId] = [];
        } else {
            onlineMembers['threads'][newThreadId] = [...onlineMembers['threads'][newThreadId]];
        }
        let {userDetails, profilePicture} = userService.getUserState();
        if (userDetails) {
            let findNewThreadUserIndex = onlineMembers['threads'][newThreadId].findIndex((item: UserProjectOnlineStatus) => item.userId === userDetails?.id);
            if (findNewThreadUserIndex !== -1) {
                onlineMembers['threads'][newThreadId][findNewThreadUserIndex] = {...onlineMembers['threads'][newThreadId][findNewThreadUserIndex]};
                onlineMembers['threads'][newThreadId][findNewThreadUserIndex].isOnline = true;
                onlineMembers['threads'][newThreadId][findNewThreadUserIndex].lastOnlineStatusCheck = dayjs().format('DD/MM/YYYY hh:mm:ss a');
                onlineMembers['threads'][newThreadId][findNewThreadUserIndex].forceWait = 0;
            } else {
                onlineMembers['threads'][newThreadId].push({
                    userId: userDetails.id,
                    avatar: (profilePicture?.url || ''),
                    color: userDetails?.color || this.getUserColor(userDetails.id!),
                    name: (userDetails.firstName || '') + ' ' + (userDetails.lastName || ' '),
                    isOnline: true,
                    lastOnlineStatusCheck: dayjs().format('DD/MM/YYYY hh:mm:ss a'),
                    forceWait: 0
                })
            }
            onlineMembers = {...this.removeAllOtherOnlineStatusForUser(onlineMembers, [newThreadId], newThread.user)}
            setMemberStatusCache(onlineMembers);
            this.setCommonState({onlineUsers: onlineMembers});
        }
    }

    removeAllOtherOnlineStatusForUser(onlineMembers: any, ignoreThreadIds: string[], userId: string | undefined) {
        onlineMembers['threads'] = {...onlineMembers['threads']};
        Object.keys(onlineMembers['threads']).forEach((threadId: string) => {
            if (!ignoreThreadIds.includes(threadId)) {
                onlineMembers['threads'][threadId] = [...onlineMembers['threads'][threadId]];
                onlineMembers['threads'][threadId].forEach((user: UserProjectOnlineStatus, index: number) => {
                    onlineMembers['threads'][threadId][index] = {...onlineMembers['threads'][threadId][index]};
                    if (userId && user.userId === userId) {
                        onlineMembers['threads'][threadId][index].isOnline = false;
                        onlineMembers['threads'][threadId][index].forceWait = 2;
                    }
                })
            }
        })
        return onlineMembers;
    }

    updateUserOnlineStatusWithSocketEvent(newMessage: any) {
        if (newMessage.name === SOCKET_EVENTS.ACTIVITY) {
            let onlineUsers: any = {...getMemberStatusCache()};
            let type = '';
            let id = '';
            if (newMessage.data.type === SOCKET_ACTIVITY_EVENTS.VIEWING_THREAD) {
                type = 'threads';
                id = newMessage.data.threadId;
            }
            if (newMessage.data.type === SOCKET_ACTIVITY_EVENTS.VIEWING_PROJECT) {
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
                    color: newMessage.data.color || this.getUserColor(newMessage.data.userId),
                    name: newMessage.data.name,
                    forceWait: 0
                })
            }
            setMemberStatusCache(onlineUsers);
            this.setCommonState({onlineUsers: onlineUsers});
        }
    }

    updateUserOnlineStatusOnInterval() {
        let {userDetails} = userService.getUserState();
        let onlineMembers: any = {...getMemberStatusCache()};
        Object.keys(onlineMembers).forEach((item: string) => {
            onlineMembers[item] = {...onlineMembers[item]};
            Object.keys(onlineMembers[item]).forEach((itemObj: string) => {
                onlineMembers[item][itemObj] = [...onlineMembers[item][itemObj]];
                onlineMembers[item][itemObj].forEach((user: object, index: number) => {
                    if (userDetails?.id !== onlineMembers[item][itemObj][index].userId) {
                        onlineMembers[item][itemObj][index] = {...onlineMembers[item][itemObj][index]};
                        let lastActiveDate = dayjs(onlineMembers[item][itemObj][index].lastOnlineStatusCheck, 'DD/MM/YYYY hh:mm:ss a');
                        if (onlineMembers[item][itemObj][index].isOnline && dayjs().diff(lastActiveDate, 'seconds') > 10) {
                            onlineMembers[item][itemObj][index].isOnline = false;
                        }
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

    toggleCreateProjectModel(enable: boolean, shouldRedirect: boolean = false, shouldAddThread: boolean = false) {
        keyNavigationService.toggleKeyNavigation(!enable);
        this.setCommonState({
            showCreateProjectModal: enable,
            shouldRedirectOnCreateProject: shouldRedirect,
            shouldAddThread: shouldAddThread
        });
    }

    toggleEditProjectModel(enable: boolean, shouldRedirect: boolean = false, passThroughProject: Project | null = null) {
        keyNavigationService.toggleKeyNavigation(!enable);
        this.setCommonState({
            showEditProjectModal: enable,
            shouldRedirectOnEditProject: shouldRedirect,
            passThroughProject: passThroughProject
        });
    }

    clearEverything() {
        authService.setUser(null);
        accountService.setSelectedAccount(null);
        organizationService.setSelectedOrganization(null);
        LocalStorageService.clearStorage();
    }
}

export const commonService = new CommonService();
