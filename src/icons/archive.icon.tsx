import {Icon} from "@chakra-ui/react";
import {IconProps} from "@/types";

export function ArchiveIcon(props: IconProps) {
    function getPath() {
        return (
            <>
                <path
                    d="M15.2057 7.29297H4.78906L5.47871 14.5343C5.56018 15.3897 6.27861 16.043 7.13787 16.043H12.8569C13.7161 16.043 14.4346 15.3897 14.5161 14.5343L15.2057 7.29297Z"
                     strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path
                    d="M16.0443 4.79036C16.0443 4.33013 15.6712 3.95703 15.2109 3.95703H4.79427C4.33403 3.95703 3.96094 4.33013 3.96094 4.79036V6.45703C3.96094 6.91726 4.33404 7.29036 4.79427 7.29036H15.2109C15.6712 7.29036 16.0443 6.91726 16.0443 6.45703V4.79036Z"
                     strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M8.125 11.043H11.875"  strokeWidth="1.5" strokeLinecap="round"
                      strokeLinejoin="round"/>
            </>
        )
    }

    return (
        <Icon viewBox="0 0 20 20" fill="none">
            {props.opacity ? <g opacity="0.5">{getPath()}</g> : getPath()}
        </Icon>
    )
}
