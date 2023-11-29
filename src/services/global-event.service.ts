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

    fireEvent(event: string | Event | any) {
        this.setGlobalEventState({event: event});
        setTimeout(() => {
            this.blankEvent();
        }, 1)
    }

    fireEventWithDelay(event: string | Event | any) {
        setTimeout(() => {
            this.fireEvent(event);
        }, 100)
    }

    blankEvent() {
        this.setGlobalEventState({event: ''});
    }

    setGlobalEventState(body: InitialGlobalEventsStateType) {
        this.dispatchAction(fireEvent, body);
    }
}

export const globalEventService = new GlobalEventService();
