import {InitialThreadStateType} from "@/types";
import {Thread} from "@/models";
import {updateThreadState} from "@/redux/threads/action-reducer";
import {BaseService} from "@/services/base.service";

class ThreadsService extends BaseService {
    constructor() {
        super();
    }

    private getThreadState(): InitialThreadStateType {
        return this.getState('threads');
    }

    setSelectedThread(thread: Thread | null) {
        this.dispatchAction(updateThreadState, {selectedThread: thread});
    }

    setTabValue(tabValue: string = '') {
        this.dispatchAction(updateThreadState, {tabValue});
    }
}

export const threadService = new ThreadsService();
