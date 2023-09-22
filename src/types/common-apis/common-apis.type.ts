import {Summary, Contacts} from "@/models";

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
}
