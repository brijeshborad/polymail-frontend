import { ReactElement } from 'react';

export declare type CollabRichTextEditorType = {
    id: string;
    onChange: (_content: string) => void;
    beforeToolbar?: ReactElement;
    afterToolbar?: ReactElement;
    extendToolbar?: ReactElement;
    content: string;
    placeholder: string;
    isToolbarVisible: boolean;
};
