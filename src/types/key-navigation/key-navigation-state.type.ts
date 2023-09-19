export declare type InitialKeyNavigationStateType = {
    action: 'idle' | 'up' | 'down' | 'right' | 'left';
    target: 'threads' | 'thread';
    currentThreadId?: string | null;
    currentMessageId?: string | null;
};
