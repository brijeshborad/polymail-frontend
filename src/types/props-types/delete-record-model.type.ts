export declare type DeleteRecordModelType = {
    onOpen: () => void,
    isOpen?: boolean,
    onClose?: () => void,
    confirmDelete?: (_type: string) => void,
    modelTitle?: string
}
