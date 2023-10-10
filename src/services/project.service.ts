import {InitialProjectState} from "@/types";
import {BaseService} from "@/services/base.service";
import {updateProjectState} from "@/redux/projects/action-reducer";
import {InviteMember, Project, TeamMember} from "@/models";

class ProjectService extends BaseService {
    constructor() {
        super();
    }

    public getProjectState(): InitialProjectState {
        return this.getState('projects');
    }

    pageChange() {
        this.setProjectState({
            project: null
        });
    }

    setProjectSearchString(value: string) {
        this.setProjectState({projectSearchedString: value});
    }

    setInvitees(inviteMembers: InviteMember[]) {
        this.setProjectState({invitees: inviteMembers});
    }

    setMembers(teamMembers: TeamMember[]) {
        this.setProjectState({members: teamMembers});
    }

    setProjectState(body: InitialProjectState) {
        this.dispatchAction(updateProjectState, body);
    }
}

export const projectService = new ProjectService();
