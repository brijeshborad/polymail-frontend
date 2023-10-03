import {Summary, Contacts, UserProjectOnlineStatus} from "@/models";

export declare type InitialCommonApisStateType = {
  summary?: Summary | null,
  isLoading?: boolean,
  error?: Error | any,
  showCreateProjectModal?: boolean,
  shouldRedirectOnCreateProject?: boolean,
  syncingEmails?: number | null,
  isComposing?: boolean,
  allowThreadSelection?: boolean,
  contacts?: Contacts[] | []
  onlineUsers?: {
    threads: { [key: string]: UserProjectOnlineStatus[] },
    projects: { [key: string]: UserProjectOnlineStatus[] }
  }
}
