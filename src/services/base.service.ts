import {getGlobalStore} from "@/utils/common.functions";

export class BaseService {

    constructor() {
    }

    protected getState(reducer: string | null = null) {
        if (reducer) {
            return getGlobalStore().getState()[reducer];
        }
        return getGlobalStore().getState()
    }

    protected dispatchAction(action: any, body: any) {
        getGlobalStore().dispatch(action(body));
    }
}
