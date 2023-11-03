import {TooltipProps} from "@/types/props-types/tooltip.type";
import {Tooltip as ChakraTooltip} from "@chakra-ui/react";

export default function Tooltip({
                                    isOpenEvent,
                                    customeOpenHandelEvent,
                                    label,
                                    placement = 'bottom',
                                    children,
                                    closeOnClick,
                                    customClass
                                }: TooltipProps) {
    return (
        <ChakraTooltip
            className={customClass || ''}
            label={label}
            placement={placement}
            bg='#000' color='#fff'
            borderRadius={8}
            padding='6px 12px'
            closeOnClick={!(closeOnClick && closeOnClick === 'no')}
            hasArrow
            isOpen={customeOpenHandelEvent ? isOpenEvent : undefined}
        >
            {children}
        </ChakraTooltip>
    )
}
