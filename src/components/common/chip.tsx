import {Button} from "@chakra-ui/react";
import React from "react";
import {IChipProps} from "@/types";
import {CloseIcon} from "@chakra-ui/icons";

export function Chip(props: IChipProps) {
    return (
        <Button color={'inherit'} size={props.size || 'sm'} variant={props.variant || 'outline'}
                borderColor={'none'} className={`${props.buttonClass}`} borderRadius={20}
                padding={'0px 10px'} marginRight={2}
                rightIcon={<CloseIcon width={'10px !important'} onClick={props.click}/>}
                height={'20px'}>{props.text || 'Save'}</Button>
    )
}
