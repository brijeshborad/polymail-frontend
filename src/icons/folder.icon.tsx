import {Icon} from "@chakra-ui/react";
import {IconProps} from "@/types";

export function FolderIcon(props: IconProps) {
    return (
        <Icon viewBox="0 0 20 20" fill="none" stroke="#08162F" className={props.className}>
            <path
                d="M16.0443 14.3776V8.1276C16.0443 7.20713 15.2981 6.46094 14.3776 6.46094H3.96094V14.3776C3.96094 15.2981 4.70713 16.0443 5.6276 16.0443H14.3776C15.2981 16.0443 16.0443 15.2981 16.0443 14.3776Z"
                strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path
                d="M11.2526 6.2526L10.4764 4.82952C10.1844 4.29408 9.6231 3.96094 9.01319 3.96094H5.6276C4.70713 3.96094 3.96094 4.70713 3.96094 5.6276V9.16927"
                strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </Icon>
    )
}
