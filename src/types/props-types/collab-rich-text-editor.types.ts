import { ReactElement } from 'react';

export declare type CollabRichTextEditorType = {
    id: string;
    isAutoFocus?: boolean;
    onCreate: () => void;
    onFileDrop: (_e: any) => void;
    beforeToolbar?: ReactElement;
    afterToolbar?: ReactElement;
    extendToolbar?: ReactElement;
    content?: string;
    placeholder: string;
    isToolbarVisible: boolean;
    className?: string
    emailSignature?: string
    projectShare?: ReactElement | string;
};
