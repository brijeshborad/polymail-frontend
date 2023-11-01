import {MessageDraft} from "@/models";

export declare type InitialDraftStateType = {
    draft?: MessageDraft | null,
    composeDraft?: MessageDraft | null,
    resumeAbleDraft?: MessageDraft | null,
    composeDraftUndo?: MessageDraft | null,
    draftUndo?: MessageDraft | null,
    updatedComposeDraft?: MessageDraft | null,
    updatedDraft?: MessageDraft | null,
    liveUpdate?: MessageDraft | null,
    sendMessage?: MessageDraft | null,
    isLoading?: boolean,
    error?: Error | any,
    success?: boolean
}


