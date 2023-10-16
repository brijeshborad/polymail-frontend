import { ReactNode } from "react"

export declare type TooltipProps = {
  label: string
  placement: 'bottom' | 'top' | 'left' | 'right'
  children: ReactNode
  isOpenEvent?: boolean
  customeOpenHandelEvent?: boolean
}
