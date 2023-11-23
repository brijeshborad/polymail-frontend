import {BaseService} from "@/services/base.service";
import {updateAccountState} from "@/redux/accounts/action-reducer";
import {InitialAccountStateType} from "@/types";
import {Account, Organization, Project} from "@/models";
import {cacheService} from "@/services/cache.service";
import {projectService} from "@/services/project.service";
import {organizationService} from "@/services/organization.service";
import {commonService} from "@/services/common.service";
import {globalEventService} from "@/services/global-event.service";

export class AccountService extends BaseService {

    constructor() {
        super();
    }

    public getAccountState(): InitialAccountStateType {
        return this.getState('accounts');
    }

    setSelectedAccount(account: Account | null) {
        this.setAccountState({selectedAccount: account});
    }

    setAccounts(accounts: Account[]) {
        this.setAccountState({accounts: accounts});
    }

    setAccountState(stateBody: InitialAccountStateType) {
        this.dispatchAction(updateAccountState, stateBody);
    }

    updateValuesFromAccount(account: Account, fireSuccess: boolean = true) {
        let projects = account.projects || [];
        cacheService.buildCache(projects.map((p: Project) => p.id) as string[]);
        let organizations = ([...account.organizations || []]).sort((a: Organization, b: Organization) => (new Date(b.created as string).valueOf() - new Date(a.created as string).valueOf()));
        let contacts = account.contacts || [];
        projectService.setProjectState({projects, isLoading: false});
        organizationService.setOrganizationState({organizations, isLoading: false});
        commonService.setCommonState({contacts, isLoading: false});
        if (fireSuccess) {
            globalEventService.fireEvent('threads.refresh');
        }
    }

}

export const accountService = new AccountService();
