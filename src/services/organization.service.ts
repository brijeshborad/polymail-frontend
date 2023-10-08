import {BaseService} from "@/services/base.service";
import {updateOrganizationState} from "@/redux/organizations/action-reducer";
import {InitialOrganizationStateType} from "@/types";
import {Organization} from "@/models";

export class OrganizationService extends BaseService {

    constructor() {
        super();
    }


    private getOrganizationState(): InitialOrganizationStateType {
        return this.getState('organization');
    }


    setSelectedOrganization(organization: Organization | null) {
        this.setOrganizationState({selectedOrganization: organization})
    }


    setOrganizationState(stateBody: InitialOrganizationStateType) {
        this.dispatchAction(updateOrganizationState, stateBody);
    }

}

export const organizationService = new OrganizationService();
