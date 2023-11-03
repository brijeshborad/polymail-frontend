import { ReactNode } from "react"

export declare type TooltipProps = {
  label: string | any,
  placement: 'bottom' | 'top' | 'left' | 'right'
  children: ReactNode
  isOpenEvent?: boolean
  customeOpenHandelEvent?: boolean
  closeOnClick?: string
  customClass?: string
}
