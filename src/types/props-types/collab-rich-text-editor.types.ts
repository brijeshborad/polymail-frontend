import { ReactElement } from 'react';

export declare type CollabRichTextEditorType = {
    onChange: (_content: string) => void;
    beforeToolbar?: ReactElement;
    afterToolbar?: ReactElement;
    extendToolbar?: ReactElement;
    content: string;
    placeholder: string;
    isToolbarVisible: boolean;
};
