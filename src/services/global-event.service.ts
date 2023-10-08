import {Event, InitialGlobalEventsStateType} from "@/types";
import {BaseService} from "@/services/base.service";
import {fireEvent} from "@/redux/global-events/action-reducer";

class GlobalEventService extends BaseService {
    constructor() {
        super();
    }

    private getGlobalEventsState(): InitialGlobalEventsStateType {
        return this.getState('globalEvents');
    }

    fireEvent(event: string | Event) {
        this.setGlobalEventState({event: event});
    }

    setGlobalEventState(body: any) {
        this.dispatchAction(fireEvent, body);
    }
}

export const globalEventService = new GlobalEventService();
