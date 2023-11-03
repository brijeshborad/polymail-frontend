import {InitialProjectState} from "@/types";
import {BaseService} from "@/services/base.service";
import {updateProjectState} from "@/redux/projects/action-reducer";
import {InviteMember, Project, TeamMember} from "@/models";
import {commonService} from "@/services/common.service";

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

    addOrUpdateProjectMemberOrInvites(type: string, memberType: string, member: TeamMember | InviteMember, passedProject: Project | null = null) {
        let {projects, project: currentOpenProject} = this.getProjectState();
        let project = currentOpenProject;
        if (passedProject) {
            project = passedProject;
        }
        let currentProject: Project = {...(project || {})} as Project;
        let currentProjects = [...(projects || [])];
        let findProjectIndex = currentProjects.findIndex((item: Project) => item.id === currentProject.id);
        if (type === 'add') {
            if (memberType === 'invite') {
                currentProject.invites = [...currentProject.invites, member as InviteMember];
                if (findProjectIndex !== 1) {
                    currentProjects[findProjectIndex] = {...currentProjects[findProjectIndex]};
                    currentProjects[findProjectIndex].invites = [...currentProjects[findProjectIndex].invites, member as InviteMember];
                }
            } else {
                currentProject.accounts = [...currentProject.accounts, member as TeamMember];
                if (findProjectIndex !== 1) {
                    currentProjects[findProjectIndex] = {...currentProjects[findProjectIndex]};
                    currentProjects[findProjectIndex].accounts = [...currentProjects[findProjectIndex].accounts, member as TeamMember];
                }
            }
        } else if (type === 'update') {
            if (memberType === 'invite') {
                currentProject.invites = [...currentProject.invites];
                let findRemovingInvite = currentProject.invites.findIndex((item: InviteMember) => item.id === member.id);
                if (findRemovingInvite !== -1) {
                    currentProject.invites[findRemovingInvite] = {
                        ...currentProject.invites[findRemovingInvite],
                        ...member
                    };
                }
                if (findProjectIndex !== 1) {
                    currentProjects[findProjectIndex] = {...currentProjects[findProjectIndex]};
                    currentProjects[findProjectIndex].invites = [...currentProjects[findProjectIndex].invites];
                    let findRemovingInvite = currentProjects[findProjectIndex].invites.findIndex((item: InviteMember) => item.id === member.id);
                    if (findRemovingInvite !== -1) {
                        currentProjects[findProjectIndex].invites[findRemovingInvite] = {
                            ...currentProjects[findProjectIndex].invites[findRemovingInvite],
                            ...member
                        };
                    }
                }
            } else {
                currentProject.accounts = [...currentProject.accounts];
                let findRemovingInvite = currentProject.accounts.findIndex((item: InviteMember) => item.id === member.id);
                if (findRemovingInvite !== -1) {
                    currentProject.accounts[findRemovingInvite] = {
                        ...currentProject.accounts[findRemovingInvite],
                        ...member
                    };
                }
                if (findProjectIndex !== 1) {
                    currentProjects[findProjectIndex] = {...currentProjects[findProjectIndex]};
                    currentProjects[findProjectIndex].accounts = [...currentProjects[findProjectIndex].accounts];
                    let findRemovingInvite = currentProjects[findProjectIndex].accounts.findIndex((item: InviteMember) => item.id === member.id);
                    if (findRemovingInvite !== -1) {
                        currentProjects[findProjectIndex].accounts[findRemovingInvite] = {
                            ...currentProjects[findProjectIndex].accounts[findRemovingInvite],
                            ...member
                        };
                    }
                }
            }
        } else {
            if (memberType === 'invite') {
                currentProject.invites = [...currentProject.invites];
                let findRemovingInvite = currentProject.invites.findIndex((item: InviteMember) => item.id === member.id);
                if (findRemovingInvite !== -1) {
                    currentProject.invites.splice(findRemovingInvite, 1);
                }
                if (findProjectIndex !== 1) {
                    currentProjects[findProjectIndex] = {...currentProjects[findProjectIndex]};
                    currentProjects[findProjectIndex].invites = [...currentProjects[findProjectIndex].invites];
                    let findRemovingInvite = currentProjects[findProjectIndex].invites.findIndex((item: InviteMember) => item.id === member.id);
                    if (findRemovingInvite !== -1) {
                        currentProjects[findProjectIndex].invites.splice(findRemovingInvite, 1);
                    }
                }
            } else {
                currentProject.accounts = [...currentProject.accounts];
                let findRemovingInvite = currentProject.accounts.findIndex((item: InviteMember) => item.id === member.id);
                if (findRemovingInvite !== -1) {
                    currentProject.accounts.splice(findRemovingInvite, 1);
                }
                if (findProjectIndex !== 1) {
                    currentProjects[findProjectIndex] = {...currentProjects[findProjectIndex]};
                    currentProjects[findProjectIndex].accounts = [...currentProjects[findProjectIndex].accounts];
                    let findRemovingInvite = currentProjects[findProjectIndex].accounts.findIndex((item: InviteMember) => item.id === member.id);
                    if (findRemovingInvite !== -1) {
                        currentProjects[findProjectIndex].accounts.splice(findRemovingInvite, 1);
                    }
                }
            }
        }

        this.setProjectState({projects: currentProjects});
        if (passedProject) {
            commonService.setCommonState({passThroughProject: currentProject});
        } else {
            this.setProjectState({project: currentProject});
        }
        this.setMembers(currentProject.accounts);
        this.setInvitees(currentProject.invites);
    }
}

export const projectService = new ProjectService();
