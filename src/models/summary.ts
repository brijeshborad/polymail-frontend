import {User} from "@/models/user";
import {Account} from "@/models/account";
import {Organization} from "@/models/organization";
import {Project} from "@/models/project";

export interface Summary {
  user?: User | null,
  accounts?: Account[],
  organizations?: Organization[],
  projects?: Project[]
}
