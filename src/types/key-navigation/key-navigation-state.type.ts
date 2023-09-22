export declare type InitialKeyNavigationStateType = {
    isEnabled: boolean;
    action: string;
    target: 'threads' | 'thread' | 'reply-box';
    currentThreadId?: string | null;
    currentMessageId?: string | null;
    threadIndex?: number;
    messageIndex?: number;
};
