import {Icon} from "@chakra-ui/react";
import {IconProps} from "@/types";

export function FileIcon(props: IconProps) {
    return (
        <Icon viewBox="0 0 20 20" fill="none" stroke="#5D5F62" onClick={(e) => props.click && props.click(e)}>
            <path
                d="M19.4531 11.9512L13.337 17.8602C11.4191 19.7132 8.30951 19.7132 6.39158 17.8602C4.4666 16.0004 4.4747 12.9827 6.40964 11.1326L12.0538 5.7009C13.3661 4.43305 15.4937 4.43304 16.806 5.70087C18.1231 6.97336 18.1175 9.03811 16.7936 10.304L11.0859 15.7859C10.3775 16.4703 9.22892 16.4703 8.52048 15.7859C7.81203 15.1014 7.81203 13.9917 8.52049 13.3072L13.247 8.74081"
                strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </Icon>
    )
}
