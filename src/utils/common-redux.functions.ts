import {ReducerActionType} from "@/types";
import {Toaster} from "@/components/common";
import {createStandaloneToast} from "@chakra-ui/react";
import {generateToasterId} from "@/utils/common.functions";

export function performSuccessActions(payload: ReducerActionType, currentResponse: any | null = null) {
    const {toast} = createStandaloneToast();

    if (payload.toaster?.success) {
        let polyToast = generateToasterId();
        if (payload.toaster.success.id) {
            polyToast = payload.toaster.success.id;
        }
        Toaster({
            desc: payload.toaster.success.desc,
            title: payload.toaster.success.title || '',
            type: payload.undoAction?.showUndoButton ? 'undo_changes' : 'success',
            id: polyToast,
            ...(payload.undoAction?.showUndoButton ? {
                undoUpdateRecordClick: () => {
                    if (payload.undoAction?.dispatch && payload.undoAction.action) {
                        payload.undoAction.dispatch(payload.undoAction.action({
                            body: payload.undoAction.undoBody,
                            ...(payload.undoAction.showToasterAfterUndoClick ? {
                                toaster: {
                                    success: {
                                        desc: payload.undoAction.undoBody?.success ? payload?.undoAction?.undoBody?.success?.desc : 'Thread was moved from ' + (payload.undoAction.undoBody?.tag || '').toLowerCase() + '.',
                                        title: payload.undoAction.undoBody?.success ? payload?.undoAction?.undoBody?.success?.title || '' : payload.toaster?.success?.title || '',
                                    }
                                },
                            } : {})
                        }));
                    }
                    toast.close(`${polyToast}`);
                    if (payload?.undoAction?.undoBody?.afterUndoAction) {
                        payload?.undoAction?.undoBody?.afterUndoAction();
                    }
                    // if (payload?.undoAction?.undoBody?.forThread) {
                    //     if (payload?.undoAction?.dispatch) {
                    //         payload?.undoAction?.dispatch(updateThreadState({
                    //             threads: payload.undoAction.undoBody?.data || [],
                    //             selectedThread: (payload.undoAction.undoBody?.data || [])[0],
                    //         }));
                    //     }
                    // }

                }
            } : {})
        });
    }

    if (payload.afterSuccessAction) {
        payload.afterSuccessAction(currentResponse);
    }
}

export function performErrorActions(payload: ReducerActionType) {
    if (payload.toaster?.error) {
        Toaster({
            desc: payload.toaster.error.desc,
            title: payload.toaster.error.title || '',
            type: 'error'
        });
    }
}
