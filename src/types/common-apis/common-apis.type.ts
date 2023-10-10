import {Summary, Contacts, UserProjectOnlineStatus} from "@/models";
import {ActivityFeed} from "@/models/activityFeed";

export declare type InitialCommonApisStateType = {
  summary?: Summary | null,
  activityFeed?: ActivityFeed[],
  isLoading?: boolean,
  error?: Error | any,
  showCreateProjectModal?: boolean,
  shouldRedirectOnCreateProject?: boolean,
  shouldAddThread?: boolean,
  syncingEmails?: number | null,
  isComposing?: boolean,
  allowThreadSelection?: boolean,
  contacts?: Contacts[] | []
  onlineUsers?: {
    threads: { [key: string]: UserProjectOnlineStatus[] },
    projects: { [key: string]: UserProjectOnlineStatus[] }
  }
}
