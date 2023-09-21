import {Summary} from "@/models/summary";

export declare type InitialCommonApisStateType = {
  summary?: Summary | null,
  isLoading?: boolean,
  error?: Error | any,
  showCreateProjectModal: boolean,
  shouldRedirectOnCreateProject: boolean,
}
