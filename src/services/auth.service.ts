import {InitialAuthState} from "@/types";
import {BaseService} from "@/services/base.service";
import {updateAuthState} from "@/redux/auth/action-reducer";
import {User} from "@/models";

class AuthService extends BaseService {
    constructor() {
        super();
    }

    public getAuthState(): InitialAuthState {
        return this.getState('auth');
    }

    setUser(user: User | null | undefined) {
        this.setAuthState({user: user});
    }

    setAuthState(body: InitialAuthState) {
        this.dispatchAction(updateAuthState, body);
    }
}

export const authService = new AuthService();
