import {InitialKeyNavigationStateType} from "@/types";
import {BaseService} from "@/services/base.service";
import {updateKeyNavigation} from "@/redux/key-navigation/action-reducer";

class KeyActionService extends BaseService {
    constructor() {
        super();
    }

    private getKeyNavigationState(): InitialKeyNavigationStateType {
        return this.getState('keyNavigation');
    }

    toggleKeyNavigation(enable: boolean) {
        this.setKeyNavigationState({isEnabled: enable});
    }

    setKeyNavigationState(body: any) {
        this.dispatchAction(updateKeyNavigation, body);
    }
}

export const keyNavigationService = new KeyActionService();
