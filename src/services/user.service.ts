import {InitialUserState} from "@/types";
import {BaseService} from "@/services/base.service";

class UserService extends BaseService {
    constructor() {
        super();
    }

    public getUserState(): InitialUserState {
        return this.getState('users');
    }
}

export const userService = new UserService();
