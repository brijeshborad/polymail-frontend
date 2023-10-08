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

    sendMessage(body: any) {
        let sendJsonMessage: SendJsonMessage | null = this.getSocketState().sendJsonMessage;
        if (sendJsonMessage) {
            sendJsonMessage(body);
        }
    }

    cancelThreadSearch(userId: string | undefined) {
        this.sendMessage({userId: userId || '', name: "SearchCancel"});
    }

    fireThreadViewActivity(userId: string | undefined, threadId: string | undefined) {
        console.log('Sending activity event THREAD');
        this.sendMessage({
            userId: userId || '',
            name: 'Activity',
            data: {
                type: "ViewingThread",
                id: threadId || '',
            },
        });
    }

    fireProjectViewActivity(userId: string | undefined, projectId: string | undefined) {
        console.log('Sending activity event PROJECT');
        this.sendMessage({
            userId: userId || '',
            name: 'Activity',
            data: {
                type: "ViewingProject",
                id: projectId || '',
            },
        });
    }
}

export const socketService = new SocketService();
