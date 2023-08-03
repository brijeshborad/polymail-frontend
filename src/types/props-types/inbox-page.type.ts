export declare type InboxTabProps = {
    content: string[],
    handleClick: (val: any) => void;
}

export declare type MailTabProps = {
    show: (val: boolean) => void;
    content: string[],
    handleContent: (val: any) => void;
    handleTab: (val: any) => void;
    tab: string,
    id: string,
}
