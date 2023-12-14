import {Summary, Contacts, UserProjectOnlineStatus, Project, ProjectRules, Thread} from "@/models";
import {ActivityFeed} from "@/models/activityFeed";

export declare type InitialCommonApisStateType = {
  summary?: Summary | null,
  activityFeed?: ActivityFeed[],
  isLoading?: boolean,
  error?: Error | any,
  showCreateProjectModal?: boolean,
  shouldRedirectOnCreateProject?: boolean,
  showEditProjectModal?: boolean,
  passThroughProject?: Project | null,
  shouldRedirectOnEditProject?: boolean,
  shouldAddThread?: boolean,
  syncingEmails?: number | null,
  isComposing?: boolean,
  allowThreadSelection?: boolean,
  contacts?: Contacts[] | []
  onlineUsers?: {
    threads: { [key: string]: UserProjectOnlineStatus[] },
    projects: { [key: string]: UserProjectOnlineStatus[] }
  },
  animateCompose?: boolean,
  animateResumeCompose?: boolean,
  projectRules?: ProjectRules[]
}
