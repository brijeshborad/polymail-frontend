import {InitialMembershipStateType} from "@/types";
import {BaseService} from "@/services/base.service";
import {updateMembershipState} from "@/redux/memberships/action-reducer";

class MembershipService extends BaseService {
    constructor() {
        super();
    }

    public getMembershipState(): InitialMembershipStateType {
        return this.getState('memberships');
    }

    setMembershipState(body: InitialMembershipStateType) {
        this.dispatchAction(updateMembershipState, body);
    }
}

export const membershipService = new MembershipService();
