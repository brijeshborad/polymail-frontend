import {Icon} from "@chakra-ui/react";
import {IconProps} from "@/types";

export function HamburgerMenuIcon(props: IconProps) {
    return (
        <Icon viewBox="0 0 24 24" fill="none" stroke={`${props.stroke || '#08162F'}`} className={props.className}>
            <path d="M4.75 5.75H19.25" stroke="#6B7280" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M4.75 18.25H19.25" stroke="#6B7280" strokeWidth="1.5" strokeLinecap="round"
                  strokeLinejoin="round"/>
            <path d="M4.75 12H19.25" stroke="#6B7280" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </Icon>
    )
}
