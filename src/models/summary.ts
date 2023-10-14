import {User} from "@/models/user";
import {Account} from "@/models/account";
import {Organization} from "@/models/organization";
import {Project} from "@/models/project";
import {Thread} from "@/models/thread";
import {ActivityFeed} from "@/models/activityFeed";

export interface Summary {
  user?: User | null,
  accounts?: Account[],
  organizations?: Organization[],
  projects?: Project[]
  project?: Project | null,
  threads?: Thread[]
  activities?: ActivityFeed[]
}
