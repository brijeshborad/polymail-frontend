import {Icon} from "@chakra-ui/react";
import {IconProps} from "@/types";

export function TimeSnoozeIcon(props: IconProps) {
    function getPath() {
        return (
            <path
                d="M16.0443 9.9987C16.0443 11.1936 15.6899 12.3617 15.0261 13.3553C14.3622 14.3488 13.4186 15.1232 12.3147 15.5805C11.2107 16.0377 9.99591 16.1574 8.82394 15.9243C7.65197 15.6912 6.57545 15.1157 5.7305 14.2708C4.88556 13.4259 4.31015 12.3493 4.07703 11.1774C3.84391 10.0054 3.96356 8.79062 4.42083 7.68665C4.87811 6.58268 5.65249 5.6391 6.64604 4.97524C7.63958 4.31137 8.80768 3.95703 10.0026 3.95703M10.2109 7.29036V9.9987L8.96094 11.0404M13.9609 3.95703H16.0443L13.9609 6.8737H16.0443"
                strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        )
    }

    return (
        <Icon viewBox="0 0 20 20" fill="none" stroke="#000000">
            {props.opacity ? <g opacity={0.5}>{getPath()}</g> : getPath()}
        </Icon>

    )
}
