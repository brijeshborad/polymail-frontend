import {ReducerActionType} from "@/types";
import {Toaster} from "@/components/common";
import {createStandaloneToast} from "@chakra-ui/react";

export function performSuccessActions(payload: ReducerActionType) {
    const {toast} = createStandaloneToast();
    if (payload.toaster?.success) {
        let polyToast = `poly-toast-${new Date().getMilliseconds()}`;
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
                                        desc: 'Thread was moved from ' + (payload.undoAction.undoBody?.tag || 'JUST CHECKING').toLowerCase() + '.',
                                        title: payload.toaster?.success?.title || ''
                                    }
                                }
                            } : {})
                        }));
                    }
                    toast.close(`${polyToast}`);
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
