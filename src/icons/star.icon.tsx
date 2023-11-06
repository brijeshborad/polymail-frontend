import {Icon} from "@chakra-ui/react";
import {IconProps} from "@/types";

export function StarIcon(props: IconProps) {
    function getPath() {
        return (
            <path
                d="M7.0026 1.41992L8.46094 6.00325H13.0443L9.29427 8.91992L10.5443 13.5033L7.0026 10.5866L3.46094 13.5033L4.71094 8.91992L0.960938 6.00325H5.54427L7.0026 1.41992Z"
                strokeLinecap="round" strokeLinejoin="round"/>
        )
    }

    return (
        <Icon viewBox="0 0 14 15" fill="none" stroke="#000000" xmlns="http://www.w3.org/2000/svg">
            {props.opacity ? <g opacity="0.5">{getPath()}</g> : getPath()}
        </Icon>
    )
}
