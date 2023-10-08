import {BaseService} from "@/services/base.service";
import {InitialCommonApisStateType} from "@/types";
import {updateCommonState} from "@/redux/common-apis/action-reducer";

class CommonService extends BaseService {
    constructor() {
        super();
    }

    private getCommonState(): InitialCommonApisStateType {
        return this.getState('commonApis');
    }

    toggleComposing(enable: boolean) {
        this.setCommonState({isComposing: enable});
    }

    toggleComposingWithThreadSelection(enable: boolean, allowSelection: boolean) {
        this.setCommonState({isComposing: enable, allowThreadSelection: allowSelection})
    }

    setCommonState(body: any) {
        this.dispatchAction(updateCommonState, body);
    }
}

export const commonService = new CommonService();
