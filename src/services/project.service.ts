import {InitialProjectState} from "@/types";
import {BaseService} from "@/services/base.service";
import {createProjectRules, markProjectRead, updateProjectState} from "@/redux/projects/action-reducer";
import {InviteMember, Project, TeamMember, Thread} from "@/models";
import {commonService} from "@/services/common.service";
import Router from "next/router";
import {Toaster} from "@/components/common";
import {userService} from "@/services/user.service";
import {cacheService} from "@/services/cache.service";
import {MAILBOX_UNREAD} from "@/utils/constants";
import {threadService} from "@/services/threads.service";
import {accountService} from "@/services/account.service";

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

    sortProjects(projects: Project[]) {
        return [...projects].sort((a: Project, b: Project) => {
            if (a.projectMeta?.favorite === b.projectMeta?.favorite) {
                return (a.projectMeta?.order || 0) - (b.projectMeta?.order || 0)
            }
            return a.projectMeta?.favorite ? -1 : 1;
        })
    }

    processProjectDeletedActivity(activity: any) {
        let {projects} = this.getProjectState();
        let currentProjects = [...(projects || [])];
        let projectId = activity.ProjectID;
        let findProject = currentProjects.findIndex((item: Project) => item.id === projectId);
        if (findProject !== -1) {
            let deletingProject = {...currentProjects[findProject]};
            currentProjects.splice(findProject, 1);
            this.setProjectState({projects: currentProjects});
            if (Router.pathname === `/projects/[project]` && Router.query.project === projectId) {
                this.setProjectState({project: null});
                Router.push('/inbox');
                Toaster({
                    type: 'error',
                    title: 'Project has been deleted',
                    desc: `${deletingProject.emoji} ${deletingProject.name}`
                })
            }
        }
    }

    processMemberActivity(activity: any) {
        let {projects} = this.getProjectState();
        let {userDetails} = userService.getUserState();
        let currentProjects = [...(projects || [])];
        let projectId = activity.ProjectID;
        let userId = activity.UserID;
        let findProject = currentProjects.findIndex((item: Project) => item.id === projectId);
        if (findProject !== -1) {
            let deletingProject = {...currentProjects[findProject]};
            let accounts = [...(deletingProject.accounts || [])];
            let findDeletedMember = accounts.findIndex((account: TeamMember) => account.userId === userId);
            if (findDeletedMember !== -1) {
                let deletingMember = {...accounts[findDeletedMember]};
                if (userDetails && deletingMember.userId === userDetails?.id) {
                    currentProjects.splice(findProject, 1);
                    this.setProjectState({projects: currentProjects});
                    if (Router.pathname === `/projects/[project]` && Router.query.project === projectId) {
                        this.setProjectState({project: null});
                        Router.push('/inbox');
                        Toaster({
                            type: 'error',
                            title: 'You have been removed from the project',
                            desc: `${deletingProject.emoji} ${deletingProject.name}`
                        })
                    }
                } else {
                    accounts.splice(findDeletedMember, 1);
                    currentProjects[findProject].accounts = accounts;
                    this.setProjectState({projects: currentProjects});
                }
            }
        }
    }

    updateThreadsCountInProject(project: Project, totalThreads: number, type: string) {
        let {projects} = this.getProjectState();
        let finalProjects: Project[] = [...(projects || [])];
        let projectIndex: number = finalProjects.findIndex((item: Project) => item.id === project.id);
        if (projectIndex !== -1) {
            let numberOfThreads = finalProjects[projectIndex].numThreads || 0;
            if (type === 'add') {
                finalProjects[projectIndex] = {
                    ...finalProjects[projectIndex],
                    numThreads: numberOfThreads + totalThreads
                }
            } else {
                finalProjects[projectIndex] = {
                    ...finalProjects[projectIndex],
                    numThreads: numberOfThreads - totalThreads
                }
            }
            this.setProjectState({projects: finalProjects});
        }
    }

    markProjectAsRead(projectId: string) {
        this.getDispatch()(markProjectRead({body: {projectId}}));
        this.updateAllThreadsAsUnreadInProject(projectId);
    }

    updateAllThreadsAsUnreadInProject(projectId: string) {
        let {threads, selectedThread} = threadService.getThreadState();
        let finalThreads = [...(threads || [])];
        finalThreads = finalThreads.map((item: Thread) => {
            item = {...item};
            let projects = (item.projects || []).map(t => t.id);
            if (projects.length > 0 && projects.includes(projectId) && item.mailboxes?.includes(MAILBOX_UNREAD)) {
                item.mailboxes = (item.mailboxes || []).filter(d => d !== MAILBOX_UNREAD)
            }
            return item;
        })
        threadService.setThreads(finalThreads);
        if (selectedThread && selectedThread.id) {
            let finalSelectThread = {...selectedThread};
            let projects = (finalSelectThread.projects || []).map(t => t.id);
            if (projects.length > 0 && projects.includes(projectId) && finalSelectThread.mailboxes?.includes(MAILBOX_UNREAD)) {
                finalSelectThread.mailboxes = (finalSelectThread.mailboxes || []).filter(d => d !== MAILBOX_UNREAD)
            }
            threadService.setSelectedThread(finalSelectThread);
        }

        this.updateAllThreadsAsUnreadInProjectCache(projectId);
    }

    updateAllThreadsAsUnreadInProjectCache(projectId: string) {
        let cacheThreads = {...cacheService.getThreadCache()};
        Object.keys(cacheThreads).forEach(key => {
            cacheThreads[key] = [...cacheThreads[key]];
            cacheThreads[key].forEach((item: Thread, index: number) => {
                let projects = (item.projects || []).map(t => t.id);
                if (projects.length > 0 && projects.includes(projectId) && item.mailboxes?.includes(MAILBOX_UNREAD)) {
                    cacheThreads[key][index] = {
                        ...cacheThreads[key][index],
                        mailboxes: (cacheThreads[key][index].mailboxes || []).filter(d => d !== MAILBOX_UNREAD)
                    }
                }
            })
        })
        cacheService.setThreadCache(cacheThreads);
    }

    addRuleForAutomation(projectRuleValues: any) {
        let {selectedAccount} = accountService.getAccountState();
        let body = {
            projectId: projectRuleValues.projectId,
            accountId: selectedAccount?.id,
            filterType: projectRuleValues.filterType,
            value: projectRuleValues.value,
        };
        let toaster = {
            desc: `Rule Created`,
            title: `Rule for ${projectRuleValues.project?.name} ${projectRuleValues.project?.emoji} has been created`,
            type: 'success'
        };
        this.dispatchAction(createProjectRules, {
            body, toaster: {success: toaster}
        });
    }
}

export const projectService = new ProjectService();
