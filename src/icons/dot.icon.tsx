import {Icon} from "@chakra-ui/react";
import {IconProps} from "@/types";

export function DotIcon(props: IconProps) {
    return (
        <Icon viewBox='0 0 200 200' color={`${props.color || 'currentColor'}`} className={props.className || ''}
              marginRight={props.marginRight || ''}>
            <path
                fill='currentColor'
                d='M 100, 100 m -75, 0 a 75,75 0 1,0 150,0 a 75,75 0 1,0 -150,0'
            />
        </Icon>
    )
}
