import {ReducerActionType} from "@/types";
import {Toaster} from "@/components/common";
import {createStandaloneToast} from "@chakra-ui/react";
import {updateThreadState} from "@/redux/threads/action-reducer";

export function performSuccessActions(payload: ReducerActionType) {
    const {toast} = createStandaloneToast();

    if (payload.toaster?.success) {
        let polyToast = `poly-toast-${new Date().getMilliseconds()}`;
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
                            ...(payload.undoAction.showToasterAfterUndoClick ? {
                                toaster: {
                                    success: {
                                        desc: 'Thread was moved from ' + (payload.undoAction.undoBody?.tag || '').toLowerCase() + '.',
                                        title: payload.toaster?.success?.title || '',
                                    }
                                },
                                body:  payload.undoAction.undoBody

                            } : {})
                        }));
                    }
                    toast.close(`${polyToast}`);
                    if (payload?.undoAction?.undoBody?.forThread) {
                        if (payload?.undoAction?.dispatch) {
                            payload?.undoAction?.dispatch(updateThreadState({
                                threads: payload.undoAction.undoBody?.data || [],
                                selectedThread: (payload.undoAction.undoBody?.data || [])[0],
                            }));
                        }
                    }

                }
            } : {})
        });
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
