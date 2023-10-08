import {getGlobalStore} from "@/utils/common.functions";

export class BaseService {

    constructor() {
    }

    protected getStore() {
        return getGlobalStore();
    }

    protected getState(reducer: string | null = null) {
        if (reducer) {
            return this.getStore().getState()[reducer];
        }
        return this.getStore().getState()
    }

    protected dispatchAction(action: any, body: any) {
        this.getStore().dispatch(action(body));
    }

    protected getDispatch() {
        return this.getStore().dispatch;
    }
}
