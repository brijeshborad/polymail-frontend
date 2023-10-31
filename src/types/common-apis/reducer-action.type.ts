import {ToasterProps} from "@/types/props-types/toaster.type";
import {AnyAction, Dispatch} from "@reduxjs/toolkit";

export declare type ReducerActionType = {
    body?: any,
    closePreviousToast?: boolean,
    toaster?: ReducerActionToasterConfig,
    afterSuccessAction?: (_response?: any) => void,
    undoAction?: ReducerActionUndoConfig,
    toasterClickAction?: (_response?: any) => void,
}

export declare type ReducerActionToasterConfig = {
    success?: ToasterProps,
    error?: ToasterProps
}

export declare type ReducerActionUndoConfig = {
    undoBody?: ReducerActionUndoOptions,
    showUndoButton?: boolean
    dispatch?: Dispatch,
    action?: (_obj: any) => AnyAction
    showToasterAfterUndoClick?: boolean
}

export declare type ReducerActionUndoOptions = {
    id?: string,
    body?: any,
    tag?: string,
    data?: any,
    forThread?: boolean,
    success?: ToasterProps,
    afterUndoAction?: () => void
}
