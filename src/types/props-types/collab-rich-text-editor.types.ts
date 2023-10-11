import { ReactElement } from 'react';

export declare type CollabRichTextEditorType = {
    id: string;
    isAutoFocus?: boolean;
    onCreate: () => void;
    beforeToolbar?: ReactElement;
    afterToolbar?: ReactElement;
    extendToolbar?: ReactElement;
    content?: string;
    placeholder: string;
    isToolbarVisible: boolean;
    className?: string
    emailSignature?: string
    projectShare?: ReactElement | string;
    onChange: (_content: string) => void;
};
