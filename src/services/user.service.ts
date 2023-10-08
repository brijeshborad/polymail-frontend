import {InitialUserState} from "@/types";
import {BaseService} from "@/services/base.service";
import {updateUserState} from "@/redux/users/action-reducer";

class UserService extends BaseService {
    constructor() {
        super();
    }

    public getUserState(): InitialUserState {
        return this.getState('users');
    }

    setUserState(stateBody: InitialUserState) {
        this.dispatchAction(updateUserState, stateBody);
    }
}

export const userService = new UserService();
