import { TooltipProps } from "@/types/props-types/tooltip.type";
import {Tooltip as ChakraTooltip} from "@chakra-ui/react";

export default function Tooltip({isOpenEvent, customeOpenHandelEvent, label, placement='bottom', children }: TooltipProps) {
  return (
    <ChakraTooltip 
      label={label} 
      placement={placement} 
      bg='#000' color='#fff' 
      borderRadius={8}
      padding='6px 12px'
      closeOnClick={true}
      hasArrow
      isOpen={customeOpenHandelEvent ? isOpenEvent : undefined}
      >
      {children}
    </ChakraTooltip>
  )
}
