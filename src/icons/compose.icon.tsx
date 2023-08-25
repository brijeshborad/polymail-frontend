import {Icon} from "@chakra-ui/react";
import {IconProps} from "@/types";

export function ComposeIcon(props: IconProps) {
    return (
        <Icon viewBox="0 0 25 25" fill="#000000" className={props.className}>
            <path
                d="M21.1 2.9c-1.1-1.1-3-1.1-4.2 0l-8.1 7.9c-.7.7-1.2 1.6-1.4 2.6L7 15.6c-.1.3 0 .7.3.9.2.2.4.3.7.3h.2l2.2-.4c1-.2 1.9-.7 2.6-1.4l8.1-8c.6-.5.9-1.3.9-2.1s-.3-1.5-.9-2zm-9.4 10.6c-.4.4-1 .7-1.6.8l-.8.2.2-.7c.1-.6.4-1.1.9-1.6l6.2-6.1L18 7.4l-6.3 6.1zm8-7.9-.4.4-1.4-1.3.4-.4c.2-.2.5-.3.7-.3.3 0 .5.1.7.3.2.2.3.4.3.6 0 .2 0 .5-.3.7z"
                className="color000000 svgShape"/>
            <path
                d="M20 9.9c-.6 0-1 .4-1 1V16c0 1.7-1.3 3-3 3H8c-1.7 0-3-1.3-3-3V8c0-1.7 1.3-3 3-3h5c.6 0 1-.4 1-1s-.4-1-1-1H8C5.2 3 3 5.2 3 8v8c0 2.8 2.2 5 5 5h8c2.8 0 5-2.2 5-5v-5.1c0-.5-.4-1-1-1z"
                className="color000000 svgShape"/>
        </Icon>
    )
}


