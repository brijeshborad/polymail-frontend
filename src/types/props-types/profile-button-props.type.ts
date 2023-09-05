import React from "react";

export declare type IProfileButtonProps = {
    text?: string,
    imageStart?: string,
    size?: string,
    variant?: string
    iconStart?: React.JSX.Element
    iconEnd?: React.JSX.Element
    imageEnd?: string
    buttonClass?: string
}


export declare type IconProps = {
    className?: string
    stroke?: string
    click?: (_e: MouseEvent | any) => void,
    marginRight?: string
}
