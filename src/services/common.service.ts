import {BaseService} from "@/services/base.service";
import {InitialCommonApisStateType} from "@/types";
import {updateCommonState} from "@/redux/common-apis/action-reducer";
import {Thread, UserDetails, UserProjectOnlineStatus} from "@/models";
import {getMemberStatusCache, setMemberStatusCache} from "@/utils/cache.functions";
import dayjs from "dayjs";
import {userService} from "@/services/user.service";

class CommonService extends BaseService {
    constructor() {
        super();
    }

    private getCommonState(): InitialCommonApisStateType {
        return this.getState('commonApis');
    }

    toggleComposing(enable: boolean) {
        this.setCommonState({isComposing: enable});
    }

    toggleComposingWithThreadSelection(enable: boolean, allowSelection: boolean) {
        this.setCommonState({isComposing: enable, allowThreadSelection: allowSelection})
    }

    setCommonState(body: any) {
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
        // onlineMembers = {...this.removeAllOtherOnlineStatusForUser(onlineMembers, [oldThreadId, newThreadId])}
        setMemberStatusCache(onlineMembers);
        this.setCommonState({onlineUsers: onlineMembers});
    }

    // removeAllOtherOnlineStatusForUser(onlineMembers, ignoreThreadIds: string[]) {
    //     Object.keys(onlineMembers['threads'])
    //     return {};
    // }
}

export const commonService = new CommonService();
