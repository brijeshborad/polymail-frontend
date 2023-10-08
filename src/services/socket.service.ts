import {BaseService} from "@/services/base.service";
import {InitialSocketType} from "@/types";
import {SendJsonMessage} from "react-use-websocket/src/lib/types";

class SocketService extends BaseService {
    constructor() {
        super();
    }

    private getSocketState(): InitialSocketType {
        return this.getState('socket');
    }

    cancelThreadSearch(userId: string | undefined) {
        let sendJsonMessage: SendJsonMessage | null = this.getSocketState().sendJsonMessage;
        if (sendJsonMessage) {
            sendJsonMessage({"userId": userId || '', "name": "SearchCancel"});
        }
    }
}

export const socketService = new SocketService();
