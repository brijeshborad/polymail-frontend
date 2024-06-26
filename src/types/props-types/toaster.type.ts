export declare type ToasterProps = {
    desc: string,
    type: string,
    title?: string,
    id?: string
    undoClick?: (_type: string) => void
    undoUpdateRecordClick?: () => void
    onClick?: () => void
}
