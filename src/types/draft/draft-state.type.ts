import {MessageDraft} from "@/models";

export declare type InitialDraftStateType = {
    draft?: MessageDraft | null,
    sendMessage?: MessageDraft | null,
    isLoading?: boolean,
    error?: Error | any,
    success?: boolean
}

